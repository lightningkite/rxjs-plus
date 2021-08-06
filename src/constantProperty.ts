import {NEVER, Observable} from "rxjs";
import {Property} from "./Property";

export class ConstantProperty<T> implements Property<T> {
    constructor(value: T) {
        this.value = value
    }

    readonly onChange: Observable<T> = NEVER;
    value: T;
}