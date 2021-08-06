import {switchMap as rxswitchMap} from "rxjs/operators";
import {Property} from "./Property";

export function flatMap<A, B>(mapper: (a: A) => Property<B>): (source: Property<A>) => Property<B> {
    return source => {
        return {
            onChange: source.onChange.pipe(rxswitchMap(x => mapper(x).onChange)),
            get value(): B {
                return mapper(source.value).value
            }
        }
    }
}