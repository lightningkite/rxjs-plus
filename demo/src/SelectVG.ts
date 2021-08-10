import {bindMutable, StandardProperty, ViewGenerator, inflateHtml, pipe, map} from 'rxjs-property'
import html from './SelectVG.html'
import {bind, bindChildren, ConstantProperty, StackProperty} from "../../src";
import {BindTestVG} from "./BindTestVG";

export class SelectVG implements ViewGenerator {
    private stack: StackProperty<ViewGenerator>
    constructor(stack: StackProperty<ViewGenerator>) {
        this.stack = stack
    }
    demos = new ConstantProperty<Array<[string, ()=>ViewGenerator]>>([
        ["Bind Test", ()=>new BindTestVG()]
    ])
    generate(): HTMLElement {
        const view = inflateHtml(html)
        const list = view.getElementsByClassName("id-list")[0] as HTMLDivElement

        bindChildren(list, this.demos, obs => {
            const button = document.createElement("button")
            bind(button, "innerHTML", pipe(obs, map(x => x[0])))
            button.addEventListener("click", ev => {
                this.stack.push(obs.value[1]())
            })
            return button
        })

        return view
    }
}