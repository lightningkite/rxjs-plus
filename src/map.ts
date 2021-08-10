import {map as rxmap} from "rxjs/operators";
import {Property} from "./Property";

export function map<A, B>(mapper: (a: A) => B): (source: Property<A>) => Property<B> {
    return source => {
        return new class extends Property<B>{
            onChange = source.onChange.pipe(rxmap(mapper))
            get value(): B {
                return mapper(source.value)
            }
        }
    }
}