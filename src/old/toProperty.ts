import {Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {Property} from "./Property";

export function toProperty<T>(defaultValue: T): (prop: Observable<T>) => Property<T>
export function toProperty<T>(): (prop: Observable<T>) => Property<T | undefined>
export function toProperty<A, B>(defaultValue?: B): (prop: Observable<A>) => Property<A | B> {
    return rx => {
        let value: A | B = defaultValue as B
        return new class extends Property<A | B> {
            onChange = tap({
                next: (x: A) => {
                    value = x
                },
                error: (err) => console.error("Oh boy, you done messed up.  Properties aren't supposed to throw errors!"),
                complete: () => console.error("Oh boy, you done messed up.  Properties aren't supposed to complete!"),
            })(rx)

            get value() {
                return value
            }
        }
    }
}