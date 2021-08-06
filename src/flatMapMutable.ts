import {switchMap as rxswitchMap} from "rxjs/operators";
import {MutableProperty} from "./Property";

export function flatMapMutable<A, B>(mapper: (a: A) => MutableProperty<B>): (source: MutableProperty<A>) => MutableProperty<B> {
    return source => {
        return {
            onChange: source.onChange.pipe(rxswitchMap(x => mapper(x).onChange)),
            get value(): B {
                return mapper(source.value).value
            },
            set value(value: B) {
                mapper(source.value).value = value
            },
            update() {
                source.update()
            }
        }
    }
}