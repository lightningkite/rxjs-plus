export function pipe<A, B>(start: A, op1: (a: A) => B): B
export function pipe<A, B, C>(start: A, op1: (a: A) => B, op2: (b: B) => C): C
export function pipe<A, B, C, D>(start: A, op1: (a: A) => B, op2: (b: B) => C, op3: (c: C) => D): D
export function pipe<A, B, C, D, E>(start: A, op1: (a: A) => B, op2: (b: B) => C, op3: (c: C) => D, op4: (d: D) => E): E
export function pipe<A, B, C, D, E, F>(start: A, op1: (a: A) => B, op2: (b: B) => C, op3: (c: C) => D, op4: (d: D) => E, op5: (e: E) => F): F
export function pipe<A, B, C, D, E, F, G>(start: A, op1: (a: A) => B, op2: (b: B) => C, op3: (c: C) => D, op4: (d: D) => E, op5: (e: E) => F, op6: (f: F) => G): G
export function pipe(start: any, ...operations: Array<(a: any) => any>): any {
    let current = start
    for (const op of operations) {
        current = op(current)
    }
    return current
}