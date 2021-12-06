import {Observable, SubscriptionLike} from 'rxjs'

export abstract class Property<T> {
    abstract readonly value: T
    abstract readonly onChange: Observable<T>

    pipe<B>(op1: (a: this) => B): B
    pipe<B, C>(op1: (a: this) => B, op2: (b: B) => C): C
    pipe<B, C, D>(op1: (a: this) => B, op2: (b: B) => C, op3: (c: C) => D): D
    pipe<B, C, D, E>(op1: (a: this) => B, op2: (b: B) => C, op3: (c: C) => D, op4: (d: D) => E): E
    pipe<B, C, D, E, F>(op1: (a: this) => B, op2: (b: B) => C, op3: (c: C) => D, op4: (d: D) => E, op5: (e: E) => F): F
    pipe<B, C, D, E, F, G>(op1: (a: this) => B, op2: (b: B) => C, op3: (c: C) => D, op4: (d: D) => E, op5: (e: E) => F, op6: (f: F) => G): G
    pipe(...operations: Array<(a: any) => any>): any {
        let current = this
        for (const op of operations) {
            current = op(current)
        }
        return current
    }
    subscribe(next: (t: T) => void): SubscriptionLike {
        next(this.value)
        return this.onChange.subscribe(next)
    }
}

export abstract class MutableProperty<T> extends Property<T> {
    abstract value: T
    abstract update(): void
}

