import {bind, bindChildren, bindMutable, Property} from "rxjs-property";
import { JSXInternal } from './jsx';
export import JSX = JSXInternal;

export function createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes: JSXInternal.AttributeCollection | null,
    ...children: any[]
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    if (attributes) {
        for (const key of Object.keys(attributes)) {
            const attributeValue = attributes[key];

            if(key.startsWith("bind-")) {
                const restOf = key.substring(5)
                // @ts-ignore
                bind(element, restOf, attributeValue)
            } else if(key.startsWith("bind2-")) {
                const broken = key.substring(6).split('-')
                // @ts-ignore
                bindMutable(element, broken[0], broken[1], attributeValue)
            } else if (key === "ref"){
                attributeValue(element)
            } else if (key === "className") { // JSX does not allow class as a valid name
                element.setAttribute("class", attributeValue);
            } else if (key.startsWith("on") && typeof attributes[key] === "function") {
                element.addEventListener(key.substring(2).toLowerCase(), attributeValue);
            } else {
                if (typeof attributeValue === "boolean" && attributeValue) {
                    element.setAttribute(key, "");
                } else {
                    element.setAttribute(key, attributeValue);
                }
            }
        }
    }

    for (const child of children) {
        appendChild(element, child);
    }

    return element;
}
export namespace createElement {
    export import JSX = JSXInternal
}

function appendChild(parent: Node, child: any) {
    if (typeof child === "undefined" || child === null) {
        return;
    }

    switch(typeof child) {
        case "function":
            child(parent)
            break
        case "string":
            parent.appendChild(document.createTextNode(child));
            break
        case "object":
            if (child instanceof Node) {
                parent.appendChild(child);
            } else if(Array.isArray(child)){
                for (const value of child) {
                    appendChild(parent, value);
                }
            } else if(child instanceof Property) {
                bind(parent as HTMLElement, "innerHTML", child as Property<string>)
            } else if(child instanceof ChildrenBinder) {
                bindChildren(parent as HTMLElement, child.bind, child.to)
            } else {
                parent.appendChild(document.createTextNode(String(child)));
            }
            break
        default:
            parent.appendChild(document.createTextNode(String(child)));
            break
    }
}
export class ChildrenBinder<T> {
    bind: Property<Array<T>>
    to: (p: Property<T>) => HTMLElement
}
export function forEach<T>(
    bind: Property<Array<T>>,
    to: (p: Property<T>) => HTMLElement
) {
    const out = new ChildrenBinder()
    out.bind = bind
    out.to = to
    return out
}