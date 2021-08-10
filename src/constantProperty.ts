import {NEVER, Observable} from "rxjs";
import {Property} from "./Property";

export class ConstantProperty<T> extends Property<T> {
    constructor(value: T) {
        super()
        this.value = value
    }

    readonly onChange: Observable<T> = NEVER;
    value: T;
}