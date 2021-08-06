import {Observable} from "rxjs";
import {Property} from "./Property";

export function rx<T>(transform: ((o: Observable<T>) => Observable<T>)): (source: Property<T>) => Property<T> {
    return source => {
        return {
            onChange: source.onChange.pipe(transform),
            get value(): T {
                return source.value
            }
        }
    }
}