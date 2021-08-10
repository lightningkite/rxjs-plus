import {bind, bindMutable, StandardProperty, ViewGenerator, inflateHtml, pipe, map} from 'rxjs-property'
import html from './BindTestVG.html'

export class BindTestVG implements ViewGenerator {
    prop = new StandardProperty("")

    generate(): HTMLElement {
        const view = inflateHtml(html)
        const testInput = view.getElementsByClassName("test-input")[0] as HTMLInputElement
        const testOutput = view.getElementsByClassName("test-output")[0] as HTMLParagraphElement
        
        bindMutable(testInput, "value", "input", this.prop)
        bind(testOutput, "innerHTML", pipe(
            this.prop,
            map(x => `You entered ${x}`),
        ))

        return view
    }
}