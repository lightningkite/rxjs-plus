import {bind, subscribeAutoDispose, ViewGenerator} from '@lightningkite/rxjs-plus'
import html from './BindTestVG.html'
import {BehaviorSubject, debounceTime, delay, map} from "rxjs";
import {elementRemoved} from "../../src";

export class BindTestVG implements ViewGenerator {
    prop = new BehaviorSubject("")
    readonly titleString: string = "Bind Test"

    generate(window: Window): HTMLElement {
        return <div>
            <div>
                <h2>RxPlus + JSX shortcuts</h2>
                <label>Test Input:
                    <input class="test-input" type="text" bind2-value-input={this.prop}/>
                </label>
                <p class="test-output">{this.prop.pipe(map(it => `You entered ${it}`))}</p>
            </div>
            <div>
                <h2>RxPlus shortcuts</h2>
                <label>Test Input:
                    <input class="test-input" type="text" ref={view => {
                        this.prop.pipe(
                            bind(view, "value", "input")
                        )
                    }}/>
                </label>
                <p class="test-output" ref={view => {
                    this.prop.pipe(
                        map(it => `You entered ${it}`),
                        subscribeAutoDispose(view, "innerText")
                    )
                }}/>
            </div>
            <div>
                <h2>Classic Rx style</h2>
                <label>Test Input:
                    <input class="test-input" type="text" ref={view => {
                        elementRemoved(view).parts.push(
                            this.prop.subscribe({
                                next(it) {
                                    view.value = it
                                }
                            })
                        )
                        view.addEventListener("input", ev => {
                            this.prop.next(view.value)
                        })
                    }}/>
                </label>
                <p class="test-output" ref={view => {
                    elementRemoved(view).parts.push(
                        this.prop.pipe(
                            map(it => `You entered ${it}`)
                        ).subscribe({
                            next(it) {
                                view.innerText = it
                            }
                        })
                    )
                }}/>
            </div>
        </div>
    }
}