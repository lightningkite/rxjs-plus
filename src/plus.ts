import {
    BehaviorSubject,
    filter,
    map,
    combineLatest,
    Observable,
    Observer,
    OperatorFunction,
    Subject,
    Subscriber,
    Subscription,
    UnaryFunction,
    of,
    combineLatestWith,
    pipe,
    flatMap,
    mergeMap,
    ObservedValueOf,
    ObservableInput,
    switchMap,
    MonoTypeOperatorFunction, finalize, defer, SubscriptionLike
} from "rxjs";
import {
    not,
    or,
    plusNumber,
    ReversibleFunction
} from "./operatorReferenceShorthand";

export interface HasValueSubject<T> extends Subject<T> {
    get value(): T;
}

export class AnonymousSubject<T> extends Subject<T> {
    public constructor(
        /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
        public destination?: Observer<T>,
        source?: Observable<T>
    ) {
        super();
        this.source = source;
    }

    next(value: T) {
        this.destination?.next?.(value);
    }

    error(err: any) {
        this.destination?.error?.(err);
    }

    complete() {
        this.destination?.complete?.();
    }

    /** @internal */
    protected _subscribe(subscriber: Subscriber<T>): Subscription {
        return this.source?.subscribe(subscriber) ?? Subscription.EMPTY;
    }
}

export class AnonymousValueSubject<T> extends AnonymousSubject<T> implements HasValueSubject<T> {
    public constructor(
        destination: Observer<T>,
        source: Observable<T>,
        public getter: () => T
    ) {
        super(destination, source);
    }

    get value(): T {
        return this.getter()
    }
}

export function observerMap<T, R>(observer: Observer<T>, unproject: (value: R) => T): Observer<R> {
    return {
        complete(): void {
            observer.complete()
        },
        error(err: any): void {
            observer.error(err)
        },
        next(value: R): void {
            observer.next(unproject(value))
        }
    }
}

export function observerMapMaybeWrite<T, R>(observer: Observer<T>, unproject: (value: R) => T | null): Observer<R> {
    return {
        complete(): void {
            observer.complete()
        },
        error(err: any): void {
            observer.error(err)
        },
        next(value: R): void {
            const result = unproject(value)
            if (result !== null) observer.next(result)
        }
    }
}

export function mapReversible<A, B>(reversible: ReversibleFunction<A, B>): UnaryFunction<Subject<A>, Subject<B>> {
    return subject => new AnonymousSubject<B>(observerMap(subject, reversible.reverse()), subject.pipe(map(reversible)))
}
export function mapSubject<T, R>(project: (value: T) => R, unproject: (value: R) => T): UnaryFunction<Subject<T>, Subject<R>> {
    return subject => new AnonymousSubject<R>(observerMap(subject, unproject), subject.pipe(map(project)))
}

export function mapSubjectMaybeWrite<T, R>(project: (value: T) => R, unproject: (value: R) => T | null): UnaryFunction<Subject<T>, Subject<R>> {
    return subject => new AnonymousSubject<R>(observerMapMaybeWrite(subject, unproject), subject.pipe(map(project)))
}

export function mapSubjectWithExisting<T, R>(project: (value: T) => R, unproject: (existing: T, value: R) => T): UnaryFunction<HasValueSubject<T>, HasValueSubject<R>> {
    return subject => new AnonymousValueSubject<R>(
        observerMap(subject, value => unproject(subject.value, value)),
        subject.pipe(map(project)),
        () => project(subject.value)
    )
}

export function withWrite<T>(write: (value: T) => void): UnaryFunction<Observable<T>, Subject<T>> {
    return obs => new AnonymousSubject<T>({
        complete(): void {},
        error(err: any): void {},
        next: write
    }, obs)
}

///////////////////

declare module 'rxjs' {
    export interface Observable<T> {
        pipe<A>(op1: UnaryFunction<this, A>): A;
        pipe<A, B>(op1: UnaryFunction<this, A>, op2: UnaryFunction<A, B>): B;
        pipe<A, B, C>(op1: UnaryFunction<this, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>): C;
        pipe<A, B, C, D>(op1: UnaryFunction<this, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>): D;
        pipe<A, B, C, D, E>(op1: UnaryFunction<this, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>): E;
        pipe<A, B, C, D, E, F>(op1: UnaryFunction<this, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>, op6: UnaryFunction<E, F>): F;
        pipe<A, B, C, D, E, F, G>(op1: UnaryFunction<this, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>, op6: UnaryFunction<E, F>, op7: UnaryFunction<F, G>): G;
        pipe<A, B, C, D, E, F, G, H>(op1: UnaryFunction<this, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>, op6: UnaryFunction<E, F>, op7: UnaryFunction<F, G>, op8: UnaryFunction<G, H>): H;
        pipe<A, B, C, D, E, F, G, H, I>(op1: UnaryFunction<this, A>, op2: UnaryFunction<A, B>, op3: UnaryFunction<B, C>, op4: UnaryFunction<C, D>, op5: UnaryFunction<D, E>, op6: UnaryFunction<E, F>, op7: UnaryFunction<F, G>, op8: UnaryFunction<G, H>, op9: UnaryFunction<H, I>): I;
    }
}

export function safeEq(first: any, second: any): boolean {
    if (first !== null && (typeof first) === "object" && first.equals) {
        return first.equals(second)
    } else {
        return first === second
    }
}

export function subjectIsEqualTo<T>(other: T): UnaryFunction<Subject<T>, Subject<boolean>> {
    return obs => obs.pipe(map(x => x == other), withWrite(x => { if(x) obs.next(other) }))
}
export function subjectIsNotEqualTo<T>(other: T): UnaryFunction<Subject<T>, Subject<boolean>> {
    return obs => obs.pipe(subjectIsEqualTo(other), mapReversible(not))
}

export function subjectProperty<T, K extends keyof T>(key: K): UnaryFunction<HasValueSubject<T>, HasValueSubject<T[K]>> {
    return mapSubjectWithExisting(
        x => x[key],
        (existing, value) => {
            existing[key] = value
            return existing
        }
    )
}

// => set.pipe(call("has", singleValue))
// export function isIn<T>(other: Observable<Set<T>>): UnaryFunction<Observable<T>, Observable<boolean>> {
//     return obs => combineLatest([obs, other], (x, y) => y.has(x))
// }

export function contains<T>(value: T): UnaryFunction<HasValueSubject<Set<T>>, Subject<boolean>> {
    return obs => obs.pipe(map(x => x.has(value)), withWrite(x => {
        if(x) {
            obs.value.delete(value)
            return obs.value
        } else {
            obs.value.add(value)
            return obs.value
        }
    }))
}
export function floatToString(obs: Subject<number>):Subject<string> {
    return obs.pipe(mapSubjectMaybeWrite(
        x => `${x}`,
        x => {
            const conv = Number.parseFloat(x)
            return Number.isNaN(conv) ? null : conv
        }
    ))
}
export function intToString(obs: Subject<number>):Subject<string> {
    return obs.pipe(mapSubjectMaybeWrite(
        x => `${x}`,
        x => {
            const conv = Number.parseInt(x)
            return Number.isNaN(conv) ? null : conv
        }
    ))
}
export function floatToStringNullable(obs: Subject<number | null>):Subject<string> {
    return obs.pipe(mapSubject(
        x => `${x ?? ''}`,
        x => {
            const conv = Number.parseFloat(x)
            return Number.isNaN(conv) ? null : conv
        }
    ))
}
export function intToStringNullable(obs: Subject<number | null>):Subject<string> {
    return obs.pipe(mapSubject(
        x => `${x ?? ''}`,
        x => {
            const conv = Number.parseInt(x)
            return Number.isNaN(conv) ? null : conv
        }
    ))
}

export function call<
    Receiver,
    FuncName extends keyof Receiver,
    Func extends Receiver[FuncName] & ((... x: Array<any>) => ReturnType),
    ReturnType
    >(functionName: FuncName, ...args: Array<Observable<unknown>>): OperatorFunction<Receiver, ReturnType> {
    return pipe(combineLatestWith(...args), map(parts => ((parts[0] as Receiver)[functionName] as Func)(parts.slice(1))))
}

// export function tuplize<F extends (...args: Array<any>)=>any>(func: F): (args: Parameters<F>) => ReturnType<F> {
//     return args => func(...args)
// }

export function mapCall<
    Func extends (...args: Array<any>) => any
    >(func: Func): OperatorFunction<{ [Key in keyof Parameters<Func>]: Parameters<Func>[Key]}, ReturnType<Func>> {
    return map(tuple => func(...tuple))
}


export function receiverToArgument<F extends (...args: any) => any>(someFunction: F): (receiver: ThisParameterType<F>, ...params: Parameters<F>) => ReturnType<F> {
    return (first, ...args) => someFunction.call(first, args)
}


export function mergeMapNotNull<T, O extends ObservableInput<any>>(
    project: (value: T, index: number) => O | null,
    concurrent?: number
): OperatorFunction<T | null, ObservedValueOf<O> | null> {
    return mergeMap((value, index) => {
        if(value === null) return of(null)
        return project(value, index) ?? of(null)
    }, concurrent)
}

export function switchMapNotNull<T, O extends ObservableInput<any>>(
    project: (value: T, index: number) => O | null
): OperatorFunction<T | null, ObservedValueOf<O> | null> {
    return switchMap((value, index) => {
        if(value === null) return of(null)
        return project(value, index) ?? of(null)
    })
}

export function setOnWhileActive<T>(observer: Observer<boolean>): MonoTypeOperatorFunction<T> {
    return obs => defer(() => {
        observer.next(true)
        return obs.pipe(finalize(() => observer.next(false)))
    })
}

export class DisposableLambda implements SubscriptionLike {
    closed: boolean = false;
    lambda: ()=>void;
    constructor(lambda: ()=>void) {
        this.lambda = lambda
    }

    unsubscribe(): void {
        if(this.closed) { return }
        this.closed = true;
        this.lambda();
    }
}

function modify<T>(modifier: (item: T)=>T): UnaryFunction<HasValueSubject<T>, void> {
    return sub => {
        sub.next(modifier(sub.value))
    }
}

export function doOnSubscribe<T>(onSubscribe: (subscription: SubscriptionLike) => void): (source: Observable<T>) =>  Observable<T> {
    return (source) => {
        return new Observable<T>(subscriber => {
            const basis = source.subscribe(subscriber)
            onSubscribe(basis)
            return basis
        })
    }
}
