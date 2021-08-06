import {MutableProperty, Property} from "./Property";
import {DisposeCondition} from "./dispose";
import {subscribe} from "./subscribe";

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

export function eventListener<OWNER extends HTMLElement,
    K extends keyof HTMLElementEventMap>(
    owner: OWNER,
    event: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
): void {
    owner.addEventListener(event, listener, options)
    elementRemoved(owner)({
        unsubscribe() {
            owner.removeEventListener(event, listener, options)
        }
    })
}

export function elementRemoved(element: HTMLElement): DisposeCondition {
    return (x) => {
        addDetatchEvent(element, () => {
            x.unsubscribe()
        })
    }
}

export function bind<OWNER extends HTMLElement, KEY extends keyof OWNER>(owner: OWNER, key: KEY, property: Property<OWNER[KEY]>) {
    elementRemoved(owner)(subscribe(value => {
        // @ts-ignore
        owner[key] = value
    })(property))
}

export function bindAction<OWNER extends HTMLElement, VALUE>(owner: OWNER, property: Property<VALUE>, action: (value: VALUE) => void) {
    elementRemoved(owner)(subscribe(action)(property))
}

export function bindMutable<OWNER extends HTMLElement, KEY extends keyof OWNER, EVENT extends keyof HTMLElementEventMap>(
    owner: OWNER,
    key: KEY,
    event: EVENT,
    property: MutableProperty<OWNER[KEY]>
) {
    let suppress = false
    eventListener(owner, event, () => {
        if (!suppress) {
            suppress = true
            property.value = owner[key]
            suppress = false
        }
    })
    elementRemoved(owner)(subscribe(value => {
        if (!suppress) {
            suppress = true
            // @ts-ignore
            owner[key] = value
            suppress = false
        }
    })(property))
}

