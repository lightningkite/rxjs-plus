import {
    ViewGenerator,
    forEach,
    xStackPush,
    HasValueSubject
} from '@lightningkite/rxjs-plus'
import {BindTestVG} from "./BindTestVG";
import {map, of, take} from "rxjs";
import {ListTestVG} from "./ListTestVG";

export class SelectVG implements ViewGenerator {
    private stack: HasValueSubject<Array<ViewGenerator>>

    readonly titleString: string = "Select Demo"
    constructor(stack: HasValueSubject<Array<ViewGenerator>>) {
        this.stack = stack
    }

    demos = of<Array<[string, ()=>ViewGenerator]>>([
        ["Bind Test", () => new BindTestVG()],
        ["List Test", () => new ListTestVG()],
    ])

    generate(window: Window): HTMLElement {
        return (<div>
            <h1>Select a demo</h1>
            <div>
                {
                    forEach(this.demos, obs => <div>
                        <button
                            onClick={ev => obs.pipe(take(1)).subscribe(x => xStackPush(this.stack, x[1]()))}
                        >{obs.pipe(map(x => x[0]))}</button>
                    </div>)
                }
            </div>
        </div>)
    }
}