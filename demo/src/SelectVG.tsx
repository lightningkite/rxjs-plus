import {
    ViewGenerator,
    forEach,
    xStackPush,
    HasValueSubject
} from 'rxjs-plus'
import {BindTestVG} from "./BindTestVG";
import {map, of, take} from "rxjs";

export class SelectVG implements ViewGenerator {
    private stack: HasValueSubject<Array<ViewGenerator>>

    constructor(stack: HasValueSubject<Array<ViewGenerator>>) {
        this.stack = stack
    }

    demos = of<Array<[string, ()=>ViewGenerator]>>([
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
                            onClick={ev => obs.pipe(take(1)).subscribe(x => xStackPush(this.stack, x[1]()))}
                        >{obs.pipe(map(x => x[0]))}</button>
                    </div>)
                }
            </div>
        </div>)
    }
}