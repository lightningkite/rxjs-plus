import {Observable} from 'rxjs'

export interface Property<T> {
    readonly value: T
    readonly onChange: Observable<T>
}

export interface MutableProperty<T> extends Property<T> {
    value: T

    update(): void
}

