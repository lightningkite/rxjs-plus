import {BehaviorSubject, fromEvent, map, mergeMap, of, Subject, take, throttleTime} from "rxjs";
import {intToString, mapReversible} from "./plus";
import {plusNumber} from "./operatorReferenceShorthand";
import {bind, onThrottledEventDo, showIn, showInSelect, subscribeAutoDispose, viewExists} from "./binding";

export function test(element: HTMLParagraphElement, field: HTMLTextAreaElement, div: HTMLDivElement, field2: HTMLInputElement) {
    of(128).pipe(
        map(x => `value = ${x}`),
        subscribeAutoDispose(element, "textContent")
    )
    new BehaviorSubject(18).pipe(
        mapReversible(plusNumber(1)),
        intToString,
        bind(field, "value", "input")
    )
    of([1, 2, 3]).pipe(
        map(x => x.map(y => y + 1)),
        map(x => x.map(y => `Item ${y}`)),
        showIn(div, prop => {
            const child = document.createElement("p")
            prop.pipe(subscribeAutoDispose(child, "textContent"))
            return child
        })
    )
    onThrottledEventDo(element, 'click', () => {

    })
    fromEvent(element, "click")
        .pipe(throttleTime(500), mergeMap(() => of(1).pipe(take(1))), subscribeAutoDispose(element, (element, value) => {
            element.innerText = "CLICK'd"
        }))
    of(true).pipe(
        subscribeAutoDispose(element, viewExists)
    )
    new BehaviorSubject("asdf").pipe(bind(field2, "value", "input"))
    new BehaviorSubject(22).pipe(bind(field2, "valueAsNumber", "input"))
    new BehaviorSubject(true).pipe(bind(field2, "checked", "input"))
    of([1, 2, 3]).pipe(
        showInSelect(document.createElement("select"), new Subject())
    )
}