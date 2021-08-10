import {StackProperty, swapViewStack, ViewGenerator} from "rxjs-property";
import {SelectVG} from "./SelectVG";
import html from './RootVG.html'
import {bind, bindAction, inflateHtml} from "../../src";

export class RootVG implements ViewGenerator {
    stack = new StackProperty<ViewGenerator>()

    constructor() {
        this.stack.push(new SelectVG(this.stack))
    }

    generate(): HTMLElement {
        const view = inflateHtml(html)
        const back = view.getElementsByClassName("id-back")[0] as HTMLButtonElement
        const swap = view.getElementsByClassName("id-content")[0] as HTMLDivElement
        bindAction(back, this.stack, stack => back.hidden = stack.length <= 1)
        swapViewStack(swap, this.stack, "butterfly-animate")
        back.addEventListener("click", ev => this.stack.pop())
        return view
    }
}