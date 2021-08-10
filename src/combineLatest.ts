import {combineLatest as rxcombineLatest} from "rxjs";
import {map as rxmap} from "rxjs/operators";
import {Property} from "./Property";

export function combineLatest<A, B, Z>(combiner: (a: A, b: B) => Z, left: Property<A>, right: Property<B>): Property<Z>
export function combineLatest<A, B, C, Z>(combiner: (a: A, b: B, c: C) => Z, a: Property<A>, b: Property<B>, c: Property<C>): Property<Z>
export function combineLatest<A, B, C, D, Z>(combiner: (a: A, b: B, c: C, d: D) => Z, a: Property<A>, b: Property<B>, c: Property<C>, d: Property<D>): Property<Z>
export function combineLatest<Z>(combiner: (...values: Array<any>) => Z, ...properties: Array<Property<any>>): Property<Z> {
    return new class extends Property<Z> {
        onChange = rxcombineLatest(properties.map(x => x.onChange)).pipe(rxmap(x => combiner(...x)))
        get value(): Z {
            return combiner(properties.map(x => x.value))
        }
    }()
}