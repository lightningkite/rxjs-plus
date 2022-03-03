import {bind, subscribeAutoDispose, ViewGenerator, forEach, showIn} from '@lightningkite/rxjs-plus'
import html from './BindTestVG.html'
import {BehaviorSubject, map} from "rxjs";

export class ListTestVG implements ViewGenerator {
    items = new BehaviorSubject([1, 2, 3])
    readonly titleString: string = "Bind Test"

    generate(window: Window): HTMLElement {
        return <div>
            <label for="test-input">Here's the list: </label>
            {/*<div>*/}
            {/*    {*/}
            {/*        forEach(this.items, obs => (<p>{obs.pipe(map(x => `${x}`))}</p>))*/}
            {/*    }*/}
            {/*</div>*/}
            <div ref={element => {
                this.items.pipe(showIn(element, obs => (<p>{obs.pipe(map(x => `${x}`))}</p>)))
            }} />
            <button onClick={ev => {
                this.items.next(this.items.value.concat([Math.round(Math.random() * 10)]))
            } }>Add Item</button>
        </div>
    }
}