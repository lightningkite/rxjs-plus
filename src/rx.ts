import {Observable} from "rxjs";
import {Property} from "./Property";

export function rx<T>(transform: ((o: Observable<T>) => Observable<T>)): (source: Property<T>) => Property<T> {
    return source => {
        return new class extends Property<T> {
            onChange = source.onChange.pipe(transform)
            get value(): T {
                return source.value
            }
        }
    }
}