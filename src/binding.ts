import {
    BehaviorSubject, combineLatest, from, fromEvent,
    map, mergeMap,
    MonoTypeOperatorFunction,
    Observable, Observer,
    of,
    Subject,
    Subscription, switchMap, take, throttleTime,
    Unsubscribable
} from 'rxjs'
import {not, plusNumber, ReversibleFunction} from "./operatorReferenceShorthand";
import {
    DisposableLambda,
    intToString,
    mapReversible,
    mapSubject,
    mapSubjectMaybeWrite,
    safeEq,
    withWrite
} from "./plus";
import { tap } from "rxjs/operators";
import { TransitionTriple } from "./transitions"

export interface VirtualProperty<RECEIVER, T> {
    get(receiver: RECEIVER): T

    set(receiver: RECEIVER, value: T): any
}

export function reverse<RECEIVER, T>(property: VirtualProperty<RECEIVER, T> | DataClassProperty<RECEIVER, T>, op: ReversibleFunction<T, T>): VirtualProperty<RECEIVER, T> {
    if(typeof property === "string") {
        return {
            get(r) { return op(r[property] as any as T) },
            set(r, value) { (r as any)[property] = op.reverse()(value) }
        }
    } else {
        return {
            get(r) { return op(property.get(r)) },
            set(r, value) { property.set(r, op.reverse()(value)) }
        }
    }
}

export function hasClass(className: string): VirtualProperty<HTMLElement, boolean> {
    return {
        get(receiver: HTMLElement): boolean {
            return receiver.classList.contains(className)
        },
        set(receiver: HTMLElement, value: boolean) {
            if (value) receiver.classList.add(className); else receiver.classList.remove(className)
        }
    }
}

export class CompositeDisposable implements Unsubscribable {
    public parts: Array<Unsubscribable> = []

    unsubscribe(): void {
        for (const part of this.parts) {
            part.unsubscribe()
        }
    }
}

export const removedSymbol = Symbol("removed")
declare global {
    interface HTMLElement {
        [removedSymbol]?: CompositeDisposable
    }
}

export function triggerDetatchEvent(view: HTMLElement) {
    let existing = view[removedSymbol];
    if (existing) existing.unsubscribe()
    view[removedSymbol] = undefined
    for (let i = 0; i < view.childNodes.length; i++) {
        const child = view.childNodes.item(i);
        if (child instanceof HTMLElement) {
            triggerDetatchEvent(child);
        }
    }
}

export function elementRemoved(element: HTMLElement): CompositeDisposable {
    mutSetup()
    let d = element[removedSymbol] ?? new CompositeDisposable()
    element[removedSymbol] = d
    return d
}

let mut: MutationObserver | undefined = undefined

function mutSetup() {
    mut = new MutationObserver(list => {
        for (const event of list) {
            for (const node of event.removedNodes) {
                if (node instanceof HTMLElement) {
                    triggerDetatchEvent(node)
                }
            }
        }
    })
    mut.observe(document.body, {
        childList: true,
        subtree: true
    })
}

export type DataClassProperty<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P } & keyof T & string;
export type VirtualPropertyKeyOrAction<OWNER extends HTMLElement, VALUE> =
    VirtualProperty<OWNER, VALUE>
    | ((e: OWNER, v: VALUE) => void)
    | DataClassProperty<OWNER, VALUE>

export function subscribeAutoDispose<OWNER extends HTMLElement, VALUE>(owner: OWNER, key?: VirtualPropertyKeyOrAction<OWNER, VALUE>): (<O extends Observable<VALUE>>(obs: O) => O) {
    if(key === undefined) {
        return property => {
            elementRemoved(owner).parts.push(property.subscribe())
            return property
        }
    }
    switch (typeof key) {
        case "string":
            return property => {
                elementRemoved(owner).parts.push(property.subscribe(value => {
                    (owner as any)[key] = value
                    if (owner instanceof HTMLInputElement && key === "checked") {
                        labelClassUpdate(owner)
                    }
                }))
                return property
            }
        case "function":
            return property => {
                elementRemoved(owner).parts.push(property.subscribe(value => {
                    key(owner, value)
                }))
                return property
            }
        default:
            return property => {
                elementRemoved(owner).parts.push(property.subscribe(value => {
                    key.set(owner, value)
                }))
                return property
            }
    }
}

function labelClassUpdate(input: HTMLInputElement) {
    const parent = input.parentElement
    if (parent instanceof HTMLLabelElement) {
        if (input.checked) parent.classList.add("checked")
        else parent.classList.remove("checked")
    }
}

export type Binder<OWNER, VALUE> = VirtualProperty<OWNER, VALUE> | DataClassProperty<OWNER, VALUE>

export function bind<OWNER extends HTMLElement, VALUE, EVENT extends keyof HTMLElementEventMap>(
    owner: OWNER,
    key: Binder<OWNER, VALUE>,
    event: EVENT
): (subject: Subject<VALUE>) => Subject<VALUE> {
    if (typeof key === "string") {
        return sub => {
            let suppress = false
            owner.addEventListener(event, () => {
                if (!suppress) {
                    suppress = true;
                    sub.next((owner as any)[key]);
                    suppress = false;
                }
            })
            elementRemoved(owner).parts.push(sub.subscribe(value => {
                if (!suppress) {
                    suppress = true;
                    (owner as any)[key] = value;
                    if (owner instanceof HTMLInputElement && key === "checked") {
                        labelClassUpdate(owner)
                    }
                    suppress = false;
                }
            }))
            return sub
        }
    } else {
        return sub => {
            let suppress = false
            owner.addEventListener(event, () => {
                if (!suppress) {
                    suppress = true;
                    sub.next(key.get(owner));
                    suppress = false;
                }
            })
            elementRemoved(owner).parts.push(sub.subscribe(value => {
                if (!suppress) {
                    suppress = true;
                    key.set(owner, value);
                    suppress = false;
                }
            }))
            return sub
        }
    }
}

export function bindNoUncheck(element: HTMLInputElement): (subject: Subject<boolean>) => Subject<boolean> {
    return sub => {
        let suppress = false
        element.addEventListener("input", () => {
            if (!suppress) {
                suppress = true
                if (element.checked) {
                    sub.next(true)
                } else {
                    element.checked = true
                    labelClassUpdate(element)
                }
                suppress = false
            }
        })
        return subscribeAutoDispose(element as any, "checked")(sub)
    }
}

export function showIn<T>(
    parent: HTMLElement,
    makeChild: (prop: Observable<T>) => HTMLElement
): MonoTypeOperatorFunction<Array<T>> {
    parent.classList.add("dynamic")
    return obs => {
        const children: Array<[HTMLElement, BehaviorSubject<T>]> = []
        elementRemoved(parent).parts.push(obs.subscribe(value => {
            const min = Math.min(children.length, value.length)
            for (let i = 0; i < min; i++) {
                children[i][1].next(value[i])
            }
            for (let i = value.length; i < children.length; i++) {
                const old = children[i]
                parent.removeChild(old[0])
            }
            children.splice(value.length, children.length - value.length)
            for (let i = children.length; i < value.length; i++) {
                const prop = new BehaviorSubject(value[i])
                const view = makeChild(prop)
                parent.appendChild(view)
                children.push([view, prop])
            }
        }))
        return obs
    }
}

export function showInTyped<T>(
    parent: HTMLElement,
    determineType: (t: T) => number,
    makeChild: (type: number, prop: Observable<T>) => HTMLElement
): MonoTypeOperatorFunction<Array<T>> {
    return obs => {
        const children: Array<[HTMLElement, BehaviorSubject<T>, number]> = []

        function makeView(type: number, value: T): [HTMLElement, BehaviorSubject<T>, number] {
            const prop = new BehaviorSubject(value)
            const view = makeChild(type, prop)
            return [view, prop, type]
        }

        elementRemoved(parent).parts.push(obs.subscribe(value => {
            const min = Math.min(children.length, value.length)
            for (let i = 0; i < min; i++) {
                const element = value[i]
                const type = determineType(element)
                if (type == children[i][2]) {
                    children[i][1].next(element)
                } else {
                    const newThing = makeView(type, element)
                    children[i][0].replaceWith(newThing[0])
                    children[i] = newThing
                }
            }
            for (let i = value.length; i < children.length; i++) {
                const old = children[i]
                parent.removeChild(old[0])
            }
            children.splice(value.length, children.length - value.length)
            for (let i = children.length; i < value.length; i++) {
                const element = value[i]
                const type = determineType(element)
                const newThing = makeView(type, element)
                parent.appendChild(newThing[0])
                children.push(newThing)
            }
        }))
        return obs
    }
}


export function showInSelect<T>(
    select: HTMLSelectElement, 
    selected: Subject<T>, 
    toString: (item: T) => string = x => `${x}`
    ): MonoTypeOperatorFunction<Array<T>> {
    return obs => {
        let lastKnownArray: Array<T> = []
        obs.pipe(
            tap({
                next(value) {
                    lastKnownArray = value
                }
            }),
            showIn(select, prop => {
                const option = document.createElement("option")
                prop.pipe(
                    map(toString),
                    subscribeAutoDispose(option, "value"),
                    subscribeAutoDispose(option, "innerText")
                )
                return option
            })
        )
        selected.pipe(
            mapSubjectMaybeWrite(
                item => lastKnownArray.findIndex(y => safeEq(y, item)),
                index => index >= 0 && index < lastKnownArray.length ? lastKnownArray[index] : null
            ),
            bind(select, "selectedIndex", "input")
        )
        return obs
    }
}

export function showInInput<T>(
    input: HTMLInputElement, 
    selected: ((item: T) => void) | Observer<T>, 
    toString: (item: T) => string = x => `${x}`): MonoTypeOperatorFunction<Array<T>> {
    return obs => {
        let lastKnownArray: Array<T> = []
        obs.pipe(
            tap({
                next(value) {
                    lastKnownArray = value
                }
            }),
            showIn(makeDatalistForElement(input), prop => {
                const option = document.createElement("option")
                prop.pipe(
                    map(toString),
                    subscribeAutoDispose(option, "value"),
                    subscribeAutoDispose(option, "innerText")
                )
                return option
            })
        )
        input.addEventListener("input", ev => {
            const index = lastKnownArray.findIndex(x => toString(x) === input.value)
            if (index !== -1) {
                if (typeof selected === 'function')
                    selected(lastKnownArray[index])
                else
                    selected.next(lastKnownArray[index])
            }
        })
        return obs
    }
}

export function makeDatalistForElement(element: HTMLElement): HTMLDataListElement {
    const datalist = document.createElement("datalist")
    elementRemoved(element).parts.push(new DisposableLambda(() => {
        datalist.remove()
    }))
    return datalist
}

export function showInPager<T>(
    element: HTMLElement & { previous: HTMLElement, next: HTMLElement, container: HTMLElement },
    selectedIndex: Subject<number> = new BehaviorSubject(0),
    makeView: (t: Observable<T>) => HTMLElement
): MonoTypeOperatorFunction<Array<T>> {
    let pastIndex = 0
    let current: HTMLElement | null = null
    return obs => {
        const obsWithIndex = combineLatest([obs, selectedIndex])
        obsWithIndex.pipe(
            map(([list, index]) => [list[index], index] as [T, number]),
            subscribeAutoDispose(element, (container, [value, index]) => {
                const newView = makeView(of(value))
                swapViewSwap(
                    container.container,
                    current,
                    newView,
                    index > pastIndex ? TransitionTriple.Companion.INSTANCE.PUSH
                        : index < pastIndex ? TransitionTriple.Companion.INSTANCE.POP
                            : TransitionTriple.Companion.INSTANCE.FADE
                )
                current = newView
                pastIndex = index
            })
        )
        onThrottledEventDoWith(element.previous, "click", selectedIndex, x => {
            const n = Math.max(0, x - 1)
            if (n != x) selectedIndex.next(n)
        })
        onThrottledEventDoWith(element.next, "click", obsWithIndex, x => {
            const n = Math.min(x[0].length - 1, x[1] + 1)
            if (n != x[1]) selectedIndex.next(n)
        })
        return obs
    }
}

export function onThrottledEventDo<T>(element: HTMLElement, eventName: string, action: () => void) {
    fromEvent(element, eventName).pipe(
        tap(ev => {
            ev.preventDefault()
            ev.stopPropagation()
        }),
        throttleTime(500),
        subscribeAutoDispose(element, action)
    )
}

export function onThrottledEventDoWith<T>(element: HTMLElement, eventName: string, observable: Observable<T>, action: (t: T) => void) {
    fromEvent(element, eventName).pipe(
        tap(ev => {
            ev.preventDefault()
            ev.stopPropagation()
        }),
        throttleTime(500),
        mergeMap(() => observable.pipe(take(1))),
        subscribeAutoDispose<HTMLElement, T>(element, (_, value) => action(value))
    )
}

export const viewVisible: VirtualProperty<HTMLElement, boolean> = {
    get(receiver: HTMLElement): boolean {
        return receiver.style.visibility != "hidden"
    },
    set(receiver: HTMLElement, value: boolean): any {
        if (value) {
            receiver.style.removeProperty("visibility")
        } else {
            receiver.style.visibility = "hidden"
        }
    }
}
export const viewExists: VirtualProperty<HTMLElement, boolean> = {
    get(receiver: HTMLElement): boolean {
        return !receiver.hidden
    },
    set(receiver: HTMLElement, value: boolean): any {
        let originalDisplayValue: string | undefined = receiver.style.display
        if(originalDisplayValue == "none") originalDisplayValue = undefined
        receiver.hidden = !value
        if (value) {
            if(originalDisplayValue)
                receiver.style.display = originalDisplayValue
            else
                receiver.style.removeProperty("display")
        } else {
            receiver.style.display = "none"
        }
    }
}

export type PathPartMid<T, V> = PropertyReference<T, V> | VirtualProperty<T, V> | ((t: T) => V)
export type PathPartEnding<T, V> = PropertyReference<T, V> | VirtualProperty<T, V> | ((t: T, v: V) => void)
export type PropertyReference<T, V> = keyof { [P in keyof T as T[P] extends V ? P : never]: P } & keyof T & string;

export function chain<A, B, C>(firstPart: PathPartMid<A, B>, secondPart: PathPartEnding<B, C>): VirtualProperty<A, C>
export function chain<A, B, C, D>(firstPart: PathPartMid<A, B>, secondPart: PathPartMid<B, C>, thirdPart: PathPartEnding<C, D>): VirtualProperty<A, D>
export function chain(...parts: Array<PathPartMid<any, any> | PathPartEnding<any, any>>): VirtualProperty<any, any> {
    return _chain(parts.slice(0, -1) as Array<PathPartMid<any, any>>, parts[parts.length - 1] as PathPartEnding<any, any>)
}

function _chain(pathParts: Array<PathPartMid<any, any>>, last: PathPartEnding<any, any>): VirtualProperty<any, any> {
    return {
        get(receiver: HTMLElement): any {
            let current: any = receiver
            for (const ref of pathParts) {
                switch (typeof ref) {
                    case "function":
                        current = ref(current)
                        break
                    case "string":
                        current = current[ref]
                        break
                    case "object":
                        current = ref.get(current)
                        break
                }
            }
            switch (typeof last) {
                case "string":
                    return current[last]
                case "object":
                    return last.get(current)
            }
        },
        set(receiver: HTMLElement, value: any): any {
            let current: any = receiver
            for (const ref of pathParts) {
                switch (typeof ref) {
                    case "function":
                        current = ref(current)
                        break
                    case "string":
                        current = current[ref]
                        break
                    case "object":
                        current = ref.get(current)
                        break
                }
            }
            switch (typeof last) {
                case "function":
                    last(current, value)
                    break
                case "string":
                    current[last] = value
                    if (current instanceof HTMLInputElement && last === "checked") {
                        labelClassUpdate(current)
                    }
                    break
                case "object":
                    last.set(current, value)
                    break
            }
        }
    }
}

export function select<K extends keyof HTMLElementTagNameMap>(tagName: K): (element: HTMLElement) => HTMLElementTagNameMap[K] {
    // return (element) => element.querySelector
    return (element) => (element.tagName === tagName) ? (element as HTMLElementTagNameMap[K]) : element.getElementsByTagName(tagName)[0]
}

export function buttonDate(type: HTMLInputElement["type"]): VirtualProperty<HTMLElement, Date> & { getInput(receiver: HTMLElement): HTMLInputElement }
export function buttonDate(type: HTMLInputElement["type"], defaultText: string): VirtualProperty<HTMLElement, Date | null> & { getInput(receiver: HTMLElement): HTMLInputElement }
export function buttonDate(type: HTMLInputElement["type"], defaultText?: string): VirtualProperty<HTMLElement, Date | null> & { getInput(receiver: HTMLElement): HTMLInputElement } {
    return {
        getInput(receiver: HTMLElement): HTMLInputElement {
            const existing = receiver.getElementsByTagName("input")[0]
            if (existing) return existing
            const made = document.createElement("input")
            made.type = type
            receiver.appendChild(made)
            made.onclick = ev => {
                if(!made.valueAsDate) made.valueAsDate = new Date()
            }
            return made
        },
        get(receiver: HTMLElement): Date | null {
            return this.getInput(receiver).valueAsDate
        },
        set(receiver: HTMLElement, value: Date | null): any {
            // if (value === null) {
            //     receiver.innerText = defaultText ?? ""
            // } else {
                this.getInput(receiver).valueAsDate = value
            // }
        }
    }
}

export function swapViewSwap(view: HTMLElement, from: HTMLElement | null, to: HTMLElement | null, animation: TransitionTriple) {

    const current = from

    //animate out
    if (current) {
        const animationOut = animation.exit
        let outAnimInHandler: (ev: AnimationEvent) => void;
        outAnimInHandler = (ev) => {
            current.onanimationend = null
            current.style.removeProperty("animation")
            view.removeChild(current)
            if(!to && view.childElementCount === 0){
                viewExists.set(view, false)
            }
        }
        current.addEventListener("animationend", outAnimInHandler)
        current.style.animation = `${animationOut} 0.25s`
    }

    //animate in
    const newView = to
    if (newView) {
        viewExists.set(view, true)
        newView.style.width = "100%"
        newView.style.height = "100%"
        const animationIn = animation.enter
        let animInHandler: (ev: AnimationEvent) => void;
        animInHandler = (ev) => {
            newView.onanimationend = null
            newView.style.removeProperty("animation")
            viewExists.set(view, true)
        }
        newView.addEventListener("animationend", animInHandler)
        newView.style.animation = `${animationIn} 0.25s` //Delay seems to make this work right
        view.appendChild(newView)
    }

}
