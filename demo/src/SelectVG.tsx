import {
    bindMutable,
    StandardProperty,
    ViewGenerator,
    inflateHtml,
    map,
    StackProperty,
    ConstantProperty,
    createElement,
    forEach
} from 'rxjs-property'
import {BindTestVG} from "./BindTestVG";

export class SelectVG implements ViewGenerator {
    private stack: StackProperty<ViewGenerator>

    constructor(stack: StackProperty<ViewGenerator>) {
        this.stack = stack
    }

    demos = new ConstantProperty<Array<[string, () => ViewGenerator]>>([
        ["Bind Test", () => new BindTestVG()],
        ["Bind Test", () => new BindTestVG()],
        ["Bind Test", () => new BindTestVG()],
        ["Bind Test", () => new BindTestVG()],
        ["Bind Test", () => new BindTestVG()],
    ])

    generate(): HTMLElement {
        return (<div>
            <h1>Select a demo</h1>
            <div>
                {
                    forEach(this.demos, obs => <div>
                        <button
                            onClick={ev => this.stack.push(obs.value[1]())}
                        >{obs.pipe(map(x => x[0]))}</button>
                    </div>)
                }
            </div>
        </div>)
    }
}