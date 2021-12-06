import {
    BehaviorSubject, from, fromEvent,
    map, mergeMap,
    MonoTypeOperatorFunction,
    Observable,
    of,
    Subject,
    Subscription, switchMap, take, throttleTime,
    Unsubscribable
} from 'rxjs'
import {plusNumber} from "./operatorReferenceShorthand";
import {
    DisposableLambda,
    intToString,
    mapReversible,
    mapSubject,
    mapSubjectMaybeWrite,
    safeEq,
    withWrite
} from "./plus";
import {tap} from "rxjs/operators";

export interface VirtualProperty<RECEIVER, T> {
    get(receiver: RECEIVER): T
}

export interface VirtualMutableProperty<RECEIVER, T> extends VirtualProperty<RECEIVER, T> {
    set(receiver: RECEIVER, value: T): any
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
    let d = element[removedSymbol] ?? new CompositeDisposable()
    element[removedSymbol] = d
    return d
}

const mut = new MutationObserver(list => {
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

export function subscribeAutoDispose<OWNER extends HTMLElement, VALUE>(owner: HTMLElement, action: (e: OWNER, v: VALUE) => void): (<O extends Observable<VALUE>>(obs: O) => O)
export function subscribeAutoDispose<OWNER extends HTMLElement, KEY extends keyof OWNER>(owner: OWNER, key: KEY): (<O extends Observable<T>, T extends OWNER[KEY]>(obs: O) => O)
export function subscribeAutoDispose<OWNER extends HTMLElement, VALUE>(owner: OWNER, key: VirtualMutableProperty<OWNER, VALUE>): (<O extends Observable<T>, T extends VALUE>(obs: O) => O)
export function subscribeAutoDispose<OWNER extends HTMLElement, VALUE>(owner: OWNER, key: string | ((e: OWNER, v: VALUE) => void) | VirtualMutableProperty<OWNER, VALUE>): (<O extends Observable<VALUE>>(obs: O) => O) {
    switch (typeof key) {
        case "string":
            return property => {
                elementRemoved(owner).parts.push(property.subscribe(value => {
                    (owner as any)[key] = value
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

export function bind<OWNER extends HTMLElement, VALUE, EVENT extends keyof HTMLElementEventMap>(
    owner: OWNER,
    virtualProperty: VirtualMutableProperty<OWNER, VALUE>,
    event: EVENT
): (subject: Subject<VALUE>) => Subject<VALUE>
export function bind<OWNER extends HTMLElement, KEY extends keyof OWNER, EVENT extends keyof HTMLElementEventMap>(
    owner: OWNER,
    key: KEY,
    event: EVENT
): (subject: Subject<OWNER[KEY]>) => Subject<OWNER[KEY]>
export function bind<OWNER extends HTMLElement, VALUE, EVENT extends keyof HTMLElementEventMap>(
    owner: OWNER,
    key: string | VirtualMutableProperty<OWNER, VALUE>,
    event: EVENT
): (subject: Subject<VALUE>) => Subject<VALUE> {
    if (typeof key === "string") {
        return sub => {
            let suppress = false
            owner.addEventListener(event, () => {
                if (!suppress) {
                    suppress = true
                    sub.next((owner as any)[key])
                    suppress = false
                }
            })
            return subscribeAutoDispose(owner as any, key)(sub)
        }
    } else {
        return sub => {
            let suppress = false
            owner.addEventListener(event, () => {
                if (!suppress) {
                    suppress = true
                    sub.next(key.get(owner))
                    suppress = false
                }
            })
            return subscribeAutoDispose(owner, key)(sub)
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
                    element.checked = false
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

export function showInSelect<T>(select: HTMLSelectElement, selected: Subject<T>, toString: (item: T) => string = x => `${x}`): MonoTypeOperatorFunction<Array<T>> {
    return obs => {
        let lastKnownArray: Array<T> = []
        obs.pipe(
            tap({ next(value) { lastKnownArray = value } }),
            showIn(select, prop => {
                const option = document.createElement("option")
                prop.pipe(
                    map(toString),
                    subscribeAutoDispose(option, "value"),
                    subscribeAutoDispose(option, "textContent")
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
export function showInInput<T>(input: HTMLInputElement, selected: (item: T) => void, toString: (item: T) => string = x => `${x}`): MonoTypeOperatorFunction<Array<T>> {
    return obs => {
        let lastKnownArray: Array<T> = []
        obs.pipe(
            tap({ next(value) { lastKnownArray = value } }),
            showIn(makeDatalistForElement(input), prop => {
                const option = document.createElement("option")
                prop.pipe(
                    map(toString),
                    subscribeAutoDispose(option, "value"),
                    subscribeAutoDispose(option, "textContent")
                )
                return option
            })
        )
        input.addEventListener("input", ev => {
            const index = lastKnownArray.findIndex(x => toString(x) === input.value)
            if(index !== -1) {
                selected(lastKnownArray[index])
            }
        })
        return obs
    }
}
export function makeDatalistForElement(element: HTMLElement): HTMLDataListElement {
    const datalist = document.createElement("datalist")
    elementRemoved(element).parts.push(new DisposableLambda(() =>{
        datalist.remove()
    }))
    return datalist
}

export function showInTyped<T>(
    parent: HTMLElement,
    determineType: (t: T) => number,
    makeChild: (type: number, prop: Observable<T>) => HTMLElement
): MonoTypeOperatorFunction<Array<T>> {
    throw Error("TODO")
}

export function onThrottledEventDo<T>(element: HTMLElement, eventName: string, action: () => void) {
    fromEvent(element, eventName, ev => ev.preventDefault()).pipe(throttleTime(500), subscribeAutoDispose(element, action))
}

export function onThrottledEventDoWith<T>(element: HTMLElement, eventName: string, observable: Observable<T>, action: (t: T) => void) {
    fromEvent(element, eventName, ev => ev.preventDefault()).pipe(
        throttleTime(500),
        mergeMap(() => observable.pipe(take(1))),
        subscribeAutoDispose<HTMLElement, T>(element, (_, value) => action(value))
    )
}

export const viewVisible: VirtualMutableProperty<HTMLElement, boolean> = {
    get(receiver: HTMLElement): boolean {
        return receiver.style.visibility == "visible"
    },
    set(receiver: HTMLElement, value: boolean): any {
        receiver.style.visibility = value ? "visible" : "hidden"
    }
}
export const viewExists: VirtualMutableProperty<HTMLElement, boolean> = {
    get(receiver: HTMLElement): boolean {
        return !receiver.hidden
    },
    set(receiver: HTMLElement, value: boolean): any {
        receiver.hidden = !value
    }
}
