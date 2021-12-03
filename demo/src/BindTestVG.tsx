import {bind, bindMutable, StandardProperty, ViewGenerator, inflateHtml, map, createElement} from 'rxjs-property'
import html from './BindTestVG.html'

export class BindTestVG implements ViewGenerator {
    prop = new StandardProperty("")

    generate(): HTMLElement {
        return <div>
            <label for="test-input">Test Input: </label>
            <input id="test-input" class="test-input" type="text" bind2-value-input={this.prop}/>
            <p class="test-output">{this.prop.pipe(
                map(x => `You entered ${x}`),
            )}</p>
        </div>
    }
}