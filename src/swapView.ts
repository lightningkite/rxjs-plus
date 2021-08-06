import {StackProperty} from "./stackProperty";
import {bindAction, triggerDetatchEvent} from "./dom";
import {Property} from "./Property";

export interface ViewGenerator {
    generate(dependency: Window): HTMLElement
}

export function swapViewStack(div: HTMLDivElement, obs: StackProperty<ViewGenerator>, animationNamePrefix: string) {
    let previousStackSize = obs.value.length;
    bindAction(div, obs, stack => {
        const newStackSize = stack.length;
        let animation = animationNamePrefix + "-fade"
        if (newStackSize > previousStackSize) {
            animation = animationNamePrefix + "-push"
        } else if (newStackSize < previousStackSize) {
            animation = animationNamePrefix + "-pop"
        }
        previousStackSize = newStackSize;
        const newVG = stack[stack.length - 1] ?? null;
        const newView = newVG?.generate(window) ?? null;
        swapViewSwap(div, newView, animation)
    })
}

export function swapViewProperty(div: HTMLDivElement, obs: Property<ViewGenerator>, animationName: string) {
    bindAction(div, obs, newVG => {
        const newView = newVG?.generate(window) ?? null;
        swapViewSwap(div, newView, animationName)
    })
}

const previousViewSymbol = Symbol("previousView")
declare global {
    interface HTMLDivElement {
        [previousViewSymbol]: HTMLElement | undefined
    }
}

export function swapViewSwap(view: HTMLDivElement, to: HTMLElement | null, animation: string) {
    if (to) {
        to.style.width = "100%";
        to.style.height = "100%";
    }
    const current = view[previousViewSymbol];
    if (to === current) {
        if (!to) {
            view.hidden = true;
            view.innerHTML = "";
        }
        return;
    }
    if (current) {
        //animate out
        const animationOut = `${animation}-out`
        setTimeout(() => {
            try {
                view.removeChild(current);
            } catch (e) {
                /*squish*/
            }
            triggerDetatchEvent(current);
        }, 250)
        current.style.animation = `${animationOut} 0.25s`

        //animate in
        if (to) {
            view.hidden = false;
            const animationIn = `${animation}-in`
            let animInHandler: (ev: AnimationEvent) => void;
            animInHandler = (ev) => {
                to.onanimationend = null;
                to.style.removeProperty("animation");
            }
            to.addEventListener("animationend", animInHandler)
            to.style.animation = `${animationIn} 0.25s`
            view.appendChild(to);
        } else {
            view.hidden = true;
            view.innerHTML = "";
        }
    } else if (to) {
        view.appendChild(to);
        view.hidden = false;
    } else {
        view.hidden = true;
        view.innerHTML = "";
    }
    view[previousViewSymbol] = to ?? undefined;
}
