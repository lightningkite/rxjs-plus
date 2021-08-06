import {Subject} from "rxjs";
import {MutableProperty} from "./Property";

export class StandardProperty<T> implements MutableProperty<T> {
    constructor(value: T) {
        this._value = value
    }

    readonly onChange = new Subject<T>()
    _value: T
    get value(): T {
        return this._value
    }

    set value(value: T) {
        this._value = value
        this.onChange.next(value)
    }

    update(): void {
        this.onChange.next(this._value)
    }
}