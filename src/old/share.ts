import {Observable} from "rxjs";
import {share as rxshare} from "rxjs/operators";
import {Property} from "./Property";

export function share<T>(source: Property<T>): Property<T> {
    let lastValue = source.value
    let listening = false
    return new class extends Property<T> {
        onChange = new Observable<T>(sub => {
            listening = true
            const o = source.onChange.subscribe(v => {
                lastValue = v
                sub.next(v)
            })
            return () => {
                o.unsubscribe()
                listening = false
            }
        }).pipe(rxshare())
        get value(): T {
            return listening ? lastValue : source.value
        }
    }
}