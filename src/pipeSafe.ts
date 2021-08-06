export function pipeSafe<A, B>(start: A, op1: (a: A) => undefined | B): B
export function pipeSafe<A, B, C>(start: A, op1: (a: A) => undefined | B, op2: (b: B) => undefined | C): C
export function pipeSafe<A, B, C, D>(start: A, op1: (a: A) => undefined | B, op2: (b: B) => undefined | C, op3: (c: C) => undefined | D): D
export function pipeSafe<A, B, C, D, E>(start: A, op1: (a: A) => undefined | B, op2: (b: B) => undefined | C, op3: (c: C) => undefined | D, op4: (d: D) => undefined | E): E
export function pipeSafe<A, B, C, D, E, F>(start: A, op1: (a: A) => undefined | B, op2: (b: B) => undefined | C, op3: (c: C) => undefined | D, op4: (d: D) => undefined | E, op5: (e: E) => undefined | F): F
export function pipeSafe<A, B, C, D, E, F, G>(start: A, op1: (a: A) => undefined | B, op2: (b: B) => undefined | C, op3: (c: C) => undefined | D, op4: (d: D) => undefined | E, op5: (e: E) => undefined | F, op6: (f: F) => undefined | G): G
export function pipeSafe(start: any, ...operations: Array<(a: any) => any>): any {
    let current = start
    for (const op of operations) {
        if (current === undefined) return undefined
        current = op(current)
    }
    return current
}