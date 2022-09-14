import { HasValueSubject } from "./plus";
import { v4 as uuidv4 } from 'uuid';
import { BehaviorSubject, bindCallback, debounceTime, interval, MonoTypeOperatorFunction, Observable, of, pipe, Subject } from "rxjs";
import { subscribeAutoDispose, swapViewSwap } from "./binding";
import { TransitionTriple, StackTransition, isUsesCustomTransition, UsesCustomTransition } from "./transitions";

export type StackSubject<T> = BehaviorSubject<Array<T>>
export type ViewGeneratorStack = StackSubject<ViewGenerator>

export interface ViewGenerator {
  generate(dependency: Window): HTMLElement
}

export namespace ViewGenerator {
  export class Default implements ViewGenerator {
    generate(dependency: Window): HTMLElement {
      return document.createElement("div");
    }
  }
}

export interface HasBackAction {
  onBackPressed(): boolean
}

export namespace HasBackActionDefaults {
  export function onBackPressed(this_: HasBackAction): boolean { return false }
}

export interface EntryPoint extends HasBackAction {
  handleDeepLink(schema: string, host: string, path: string, params: Map<string, string>): void

  readonly mainStack: (BehaviorSubject<Array<ViewGenerator>> | null);
}

export namespace EntryPointDefaults {
  export function onBackPressed(this_: EntryPoint): boolean { return false }
  export function handleDeepLink(this_: EntryPoint, schema: string, host: string, path: string, params: Map<string, string>): void {
    console.log(`${schema}://${host}${path} ${params}`)
  }
  export function getMainStack(this_: EntryPoint): (BehaviorSubject<Array<ViewGenerator>> | null) { return null }
}

export function requestLocation(
  accuracyBetterThanMeters: number = 10.0
): Observable<GeolocationCoordinates> {
  return new Observable(subscriber => {
    navigator.geolocation.getCurrentPosition(
      (position) => subscriber.next(position.coords),
      (err) => subscriber.error(err),
      {
        enableHighAccuracy: accuracyBetterThanMeters <= 100
      }
    )
  })
}

export function openFiles(type: string): Observable<Array<File>> {
  return new Observable(subscriber => {
    const f = document.createElement("input") as HTMLInputElement;
    f.type = "file";
    f.accept = type;
    f.multiple = true;
    f.onchange = (e) => {
      if (f.files) {
        const files: Array<File> = [];
        const fList = f.files;
        if (fList) {
          for (let i = 0; i < fList.length; i++) {
            files.push(fList.item(i) as File);
          }
        }
        subscriber.next(files)
        subscriber.complete()
      }
    };
    f.click();
  })
}

export function openFile(type: string, capture: boolean | null = null): Observable<File> {
  return new Observable(subscriber => {
    const f = document.createElement("input") as HTMLInputElement;
    f.type = "file";
    f.accept = type;
    f.multiple = false;
    if (capture) {
      (f as any).capture = capture ? "user" : "environment";
    }
    f.onchange = (e) => {
      if (f.files) {
        const file = f.files[0];
        if (file) {
          subscriber.next(file);
          subscriber.complete()
        }
      }
    };
    f.click();
  })
}

export function downloadFile(url: string) {
  const a = document.createElement("a") as HTMLAnchorElement
  a.href = url
  a.download = ""
  a.click()
}

export function downloadFileData(data: Int8Array, name: string, type: string) {
  const a = document.createElement("a") as HTMLAnchorElement
  a.href = URL.createObjectURL(new Blob([data], {
    type: type
  }))
  a.download = name
  a.click()
}

export function getColor(variableName: string): string {
  if (!variableName.startsWith("var(")) return variableName;
  return getComputedStyle(document.body).getPropertyValue(variableName.slice(4, variableName.length - 1)).trim();
}

export function openEvent(title: string, description: string, location: string, start: Date, end: Date): void {
  let calText = "BEGIN:VCALENDAR\nVERSION:2.0\nCALSCALE:GREGORIAN\nPRODID:adamgibbons/ics\nMETHOD:PUBLISH\nBEGIN:VEVENT\n";
  calText += "UID:" + uuidv4() + "\n";
  calText += "SUMMARY:" + title + "\n";
  calText += "DTSTART:" + start.toISOString().replace(":", "").replace("-", "") + "\n";
  calText += "DTSTAMP:" + start.toISOString().replace(":", "").replace("-", "") + "\n";
  calText += "DTEND:" + end.toISOString().replace(":", "").replace("-", "") + "\n";
  calText += "DESCRIPTION:" + description + "\n";
  calText += "LOCATION:" + location + "\n";
  calText += "END:VEVENT\nEND:VCALENDAR";
  const a = document.createElement("a") as HTMLAnchorElement;
  a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(calText);
  a.download = "event.ics";
  a.click();
}

export const lastDialog = new BehaviorSubject<(DialogRequest | null)>(null);

export const showDialogEvent: Subject<DialogRequest> = new Subject();

export interface DialogRequest {
  _string: string;
  confirmation?: (() => void);
}

export function showDialog(request: DialogRequest | string): void {
  if (typeof request === "string") request = { _string: request }
  lastDialog.next(request);
  showDialogEvent.next(request);
}

showDialogEvent.subscribe({
  next(value) {
    const top = document.createElement("div");
    top.classList.add("resp-sharing-dialog-back");
    // const dialog = document.createElement("dialog");
    const dialog = document.createElement("div");
    dialog.classList.add("rxjs-plus-dialog-front");

    const message = document.createElement("p");
    message.classList.add("rxjs-plus-dialog-message");
    message.innerText = value._string;
    dialog.appendChild(message);

    const buttons = document.createElement("div");
    buttons.classList.add("rxjs-plus-dialog-buttons")

    if (value.confirmation) {
      const cancel = document.createElement("button");
      cancel.classList.add("rxjs-plus-dialog-cancel");
      cancel.innerText = "Cancel";
      cancel.onclick = (e) => {
        e.preventDefault();
        document.body.removeChild(top);
      }
      buttons.appendChild(cancel);
    }

    const ok = document.createElement("button");
    ok.classList.add("rxjs-plus-dialog-ok");
    ok.innerText = "OK";
    ok.onclick = (e) => {
      e.preventDefault();
      if (value.confirmation) {
        value.confirmation();
      }
      document.body.removeChild(top);
    }
    buttons.appendChild(ok);

    dialog.appendChild(buttons);

    dialog.onclick = (e) => {
      e.preventDefault();
    }
    top.onclick = (e) => {
      e.preventDefault();
      document.body.removeChild(top);
    };
    top.appendChild(dialog);
    document.body.appendChild(top);
  }
});

export function share(
  title: string,
  message: (string | null) = null,
  url: (string | null) = null,
  // image: (Image | null) = null
): void {
  if(navigator.canShare == undefined || navigator.share === undefined) {
    const s = document.createElement('script')
    s.onload = () => innerShare(title, message, url)
    s.type = 'text/javascript'
    s.src = "https://unpkg.com/share-api-polyfill/dist/share-min.js"
    document.head.appendChild(s)
  } else {
    innerShare(title, message, url)
  }
}

function innerShare(
    title: string,
    message: (string | null) = null,
    url: (string | null) = null,
    // image: (Image | null) = null
) {
  navigator.share({
    text: message ?? undefined,
    title: title,
    url: url ?? undefined
  })
}

export function xStackBackPressPop<T>(self: HasValueSubject<Array<T>>): boolean {
  if (self.value.length == 0) return false
  const last = self.value[self.value.length - 1]
  if ((last as any).onBackPressed && (last as any as HasBackAction).onBackPressed()) return true
  return xStackPop(self)
}
export function xStackBackPressDismiss<T>(self: HasValueSubject<Array<T>>): boolean {
  if (self.value.length == 0) return false
  const last = self.value[self.value.length - 1]
  if ((last as any).onBackPressed && (last as any as HasBackAction).onBackPressed()) return true
  return xStackDismiss(self)
}
export function xStackPush<T>(self: HasValueSubject<Array<T>>, value: T) {
  self.next(self.value.concat([value]))
}
export function xStackSwap<T>(self: HasValueSubject<Array<T>>, value: T) {
  self.next(self.value.slice(0, self.value.length - 1).concat([value]))
}
export function xStackPop<T>(self: HasValueSubject<Array<T>>): boolean {
  if (self.value.length <= 1) return false
  self.next(self.value.slice(0, self.value.length - 1))
  return true
}
export function xStackDismiss<T>(self: HasValueSubject<Array<T>>): boolean {
  if (self.value.length == 0) return false
  self.next(self.value.slice(0, self.value.length - 1))
  return true
}
export function xStackPopToPredicate<T>(self: HasValueSubject<Array<T>>, predicate: (value: T) => Boolean) {
  const newValue = self.value
  for (let i = newValue.length - 1; i >= 0; i--) {
    if (predicate(newValue[i])) {
      self.next(self.value.slice(0, i + 1))
      return
    }
  }
}
export function xStackRoot<T>(self: HasValueSubject<Array<T>>) {
  self.next(self.value.slice(0, 1))
}
export function xStackReset<T>(self: HasValueSubject<Array<T>>, value: T) {
  self.next([value])
}

export function showAnyInSwap<T>(
  parent: HTMLDivElement,
  transition: TransitionTriple = TransitionTriple.Companion.INSTANCE.FADE,
  makeView: (arg0: T) => HTMLElement,
): MonoTypeOperatorFunction<T> {
  let currentValue: T | null = null
  let currentView: HTMLElement | null = null
  return subscribeAutoDispose<HTMLDivElement, T>(parent, (element, nextValue) => {
    if (nextValue === currentValue) return
    const nextView = makeView(nextValue)
    swapViewSwap(parent, currentView, nextView, transition)
    currentView = nextView
    currentValue = nextValue
  })
}

export function showInSwap<T extends ViewGenerator>(
  parent: HTMLDivElement,
  dependency: Window,
  transition: TransitionTriple = TransitionTriple.Companion.INSTANCE.FADE,
): MonoTypeOperatorFunction<T> {
  let currentGenerator: T | null = null
  let currentView: HTMLElement | null = null
  return subscribeAutoDispose<HTMLDivElement, T>(parent, (element, nextGenerator) => {
    if (nextGenerator === currentGenerator) return
    const nextView = nextGenerator.generate(dependency)
    swapViewSwap(parent, currentView, nextView, transition)
    currentView = nextView
    currentGenerator = nextGenerator
  })
}

function tryCastPrimitive<T>(item: any | null, key: string): T | null {
  if (typeof item === key) {
    return item as T;
  } else {
    return null;
  }
}

export function showInSwapCustom<T extends ViewGenerator>(
  parent: HTMLDivElement,
  dependency: Window,
  stackTransition: StackTransition = StackTransition.Companion.INSTANCE.PUSH_POP,
): MonoTypeOperatorFunction<Array<T>> {
  let currentView: HTMLElement | null = null
  let currentGenerator: ViewGenerator | null = null
  let previousStackSize = 0;
  return pipe(
    debounceTime(50),
    subscribeAutoDispose<HTMLDivElement, Array<T>>(parent, (element, value) => {
      let newGenerator = value[value.length - 1] ?? null
      let newStackSize = value.length
      if (currentGenerator === newGenerator) return
      const nextView = newGenerator?.generate(dependency) ?? null

      let transition = stackTransition.neutral
      if (previousStackSize === 0) {
        transition = tryCastPrimitive<UsesCustomTransition>(newGenerator, typeof newGenerator)?.transition?.neutral ?? stackTransition.neutral
      } else if (newStackSize === 0) {
        transition = tryCastPrimitive<UsesCustomTransition>(currentGenerator, typeof currentGenerator)?.transition?.pop ?? stackTransition.pop
      } else if (newStackSize > previousStackSize) {
        transition = tryCastPrimitive<UsesCustomTransition>(newGenerator, typeof newGenerator)?.transition?.push ?? stackTransition.push
      } else if (newStackSize < previousStackSize) {
        transition = tryCastPrimitive<UsesCustomTransition>(newGenerator, typeof newGenerator)?.transition?.pop ?? stackTransition.pop
      } else {
        transition = tryCastPrimitive<UsesCustomTransition>(newGenerator, typeof newGenerator)?.transition?.neutral ?? stackTransition.neutral
      }
      swapViewSwap(parent, currentView, nextView, transition)
      currentView = nextView
      currentGenerator = newGenerator
      previousStackSize = newStackSize
    })
  )
}

export function replaceWithStyles(oldElement: HTMLElement, newElement: HTMLElement) {
  newElement.style.cssText += oldElement.style.cssText
  newElement.className += " " + oldElement.className
  oldElement.replaceWith(newElement)
}