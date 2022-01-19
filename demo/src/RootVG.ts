import {HasValueSubject, ViewGenerator, xStackPush, showInSwap, subscribeAutoDispose, xStackPop} from "rxjs-plus";
import {SelectVG} from "./SelectVG";
import html from './RootVG.html'
import {BehaviorSubject, map} from "rxjs";
import {inflateHtmlFile} from './html-helpers'

export class RootVG implements ViewGenerator {
    stack: HasValueSubject<Array<ViewGenerator>> = new BehaviorSubject<Array<ViewGenerator>>([])

    readonly titleString: string = "Root"
    constructor() {
        xStackPush(this.stack, new SelectVG(this.stack))
    }

    generate(window: Window): HTMLElement {
        const view = inflateHtmlFile(html, "back", "content")
        this.stack.pipe(
            map(stack => stack.length <= 1),
            subscribeAutoDispose(view.back, "hidden")
        )
        this.stack.pipe(
            showInSwap(view.content as HTMLDivElement)
        )
        view.back.addEventListener("click", ev => xStackPop(this.stack))
        return view._root
    }
}