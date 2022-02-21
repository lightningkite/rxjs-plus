
export interface ReversibleFunction<A, B> {
    (value: A): B
    reverse(): ReversibleFunction<B, A>
}

export function isNonNull<T>(value: T): value is NonNullable<T> {
    return value !== null;
}

export function plus(left: number, right: number): number
export function plus(left: string, right: any): string
export function plus(left: any, right: any): any { return left + right }

export function minus(left: number, right: number): number { return left - right }
export function times(left: number, right: number): number { return left * right }
export function div(left: number, right: number): number { return left / right }
export function mod(left: number, right: number): number { return left % right }
export function and(left: boolean, right: boolean): boolean { return left && right }
export function or(left: boolean, right: boolean): boolean { return left || right }

export const not: ReversibleFunction<boolean, boolean> = Object.assign(function(value: boolean): boolean { return !value }, { reverse: () => not })
export const negate: ReversibleFunction<number, number> = Object.assign(function(value: number): number { return -value }, { reverse: () => negate })
export function plusNumber(constant: number): ReversibleFunction<number, number> {
    return Object.assign(function(value: number): number { return value + constant }, { reverse: () => plusNumber(-constant) })
}
export function minusNumber(constant: number): ReversibleFunction<number, number> { return plusNumber(-constant) }
export function timesNumber(constant: number): ReversibleFunction<number, number> {
    return Object.assign(function(value: number): number { return value * constant }, { reverse: () => divNumber(constant) })
}
export function divNumber(constant: number): ReversibleFunction<number, number> {
    return Object.assign(function(value: number): number { return value / constant }, { reverse: () => timesNumber(constant) })
}
