import {Subject} from "rxjs";
import {MutableProperty, Property} from "./Property";

export class StackProperty<T> implements Property<Array<T>> {
    value: Array<T> = []

    readonly onChange = new Subject<Array<T>>()

    update(): void {
        this.onChange.next(this.value)
    }

    public push(t: T): void {
        this.value.push(t);
        this.onChange.next(this.value);
    }

    public swap(t: T): void {
        this.value.splice((this.value.length - 1), 1);
        this.value.push(t);
        this.onChange.next(this.value);
    }

    public pop(): boolean {
        if (this.value.length <= 1) {
            return false;
        }
        this.value.splice((this.value.length - 1), 1);
        this.onChange.next(this.value);
        return true;
    }

    public dismiss(): boolean {
        if (this.value.length === 0) {
            return false;
        }
        this.value.splice((this.value.length - 1), 1);
        this.onChange.next(this.value);
        return true;
    }

    public popTo(t: T): void {
        let found = false;

        for (let i = 0; i < this.value.length - 1; i++) {
            if (found) {
                this.value.splice((this.value.length - 1), 1);
            } else {
                if (this.value[i] === t) {
                    found = true;
                }
            }
        }
        this.onChange.next(this.value);
    }

    public popToPredicate(predicate: ((a: T) => boolean)): void {
        let found = false;

        for (let i = 0; i < this.value.length - 1; i++) {
            if (found) {
                this.value.splice((this.value.length - 1), 1);
            } else {
                if (predicate(this.value[i])) {
                    found = true;
                }
            }
        }
        this.onChange.next(this.value);
    }

    public root(): void {
        this.popTo(this.value[0]);
    }

    public reset(t: T): void {
        this.value.length = 0;
        this.value.push(t);
        this.onChange.next(this.value);
    }
}