import {map as rxmap} from "rxjs/operators";
import {Property} from "./Property";
import {PartialObserver, Subscription} from "rxjs";

export function subscribe<A>(next: (a: A)=>void): (source: Property<A>) => Subscription {
    return source => {
        next(source.value)
        return source.onChange.subscribe(next)
    }
}