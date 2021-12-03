import {MutableProperty, Property} from "./Property";
import {DisposeCondition} from "./dispose";
import {StandardProperty} from "./standardProperty";

export const detatchEventSymbol = Symbol("detatchEvent")
declare global {
    interface HTMLElement {
        [detatchEventSymbol]: Array<(view: HTMLElement) => void> | undefined
    }
}

export function addDetatchEvent(view: HTMLElement, action: (view: HTMLElement) => void) {
    let existing = view[detatchEventSymbol];
    if (Array.isArray(existing)) {
        existing.push(action);
    } else {
        view[detatchEventSymbol] = [action];
    }
}

export function triggerDetatchEvent(view: HTMLElement) {
    let existing = view[detatchEventSymbol];
    if (Array.isArray(existing)) {
        for (const element of existing) {
            (element as (view: Node) => void)(view);
        }
    }
    for (let i = 0; i < view.childNodes.length; i++) {
        const child = view.childNodes.item(i);
        if (child instanceof HTMLElement) {
            triggerDetatchEvent(child);
        }
    }
}

export function elementRemoved(element: HTMLElement): DisposeCondition {
    return (x) => {
        addDetatchEvent(element, () => {
            x.unsubscribe()
        })
    }
}

export function bind<OWNER extends HTMLElement, KEY extends keyof OWNER>(owner: OWNER, key: KEY, property: Property<OWNER[KEY]>) {
    elementRemoved(owner)(property.subscribe(value => {
        // @ts-ignore
        owner[key] = value
    }))
}

export function bindAction<OWNER extends HTMLElement, VALUE>(owner: OWNER, property: Property<VALUE>, action: (value: VALUE) => void) {
    elementRemoved(owner)(property.subscribe(action))
}

export function bindMutable<OWNER extends HTMLElement, KEY extends keyof OWNER, EVENT extends keyof HTMLElementEventMap>(
    owner: OWNER,
    key: KEY,
    event: EVENT,
    property: MutableProperty<OWNER[KEY]>
) {
    let suppress = false
    owner.addEventListener(event, () => {
        if (!suppress) {
            suppress = true
            property.value = owner[key]
            suppress = false
        }
    })
    elementRemoved(owner)(property.subscribe(value => {
        if (!suppress) {
            suppress = true
            // @ts-ignore
            owner[key] = value
            suppress = false
        }
    }))
}

export function bindChildren<T>(
    parent: HTMLElement,
    list: Property<Array<T>>,
    makeChild: (prop: Property<T>) => HTMLElement
) {
    const children: Array<[HTMLElement, StandardProperty<T>]> = []
    elementRemoved(parent)(list.subscribe((value: Array<T>) => {
        const min = Math.min(children.length, value.length)
        for (let i = 0; i < min; i++) {
            children[i][1].value = value[i]
        }
        for (let i = value.length; i < children.length; i++) {
            const old = children[i]
            parent.removeChild(old[0])
            triggerDetatchEvent(old[0])
        }
        children.splice(value.length, children.length - value.length)
        for (let i = children.length; i < value.length; i++) {
            const prop = new StandardProperty(value[i])
            const view = makeChild(prop)
            parent.appendChild(view)
            children.push([view, prop])
        }
    }))
}