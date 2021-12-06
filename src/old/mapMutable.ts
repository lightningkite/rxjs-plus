import {map as rxmap} from "rxjs/operators";
import {MutableProperty} from "./Property";

export function mapMutable<A, B>(mapper: (a: A) => B, reverse: (b: B) => A): (source: MutableProperty<A>) => MutableProperty<B> {
    return source => {
        return new class extends MutableProperty<B>{
            onChange = source.onChange.pipe(rxmap(mapper))
            get value(): B {
                return mapper(source.value)
            }
            set value(value: B) {
                source.value = reverse(value)
            }
            update() {
                source.update()
            }
        }
    }
}