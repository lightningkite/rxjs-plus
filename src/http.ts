import {
    from,
    map,
    mergeMap,
    MonoTypeOperatorFunction,
    Observable,
    Observer, OperatorFunction, pipe,
    SchedulerLike, shareReplay, Subject, switchMap,
    timeout,
    Unsubscribable, using
} from "rxjs";
import {CompositeDisposable} from "./binding";

export interface WebSocketFrame {
    binary: Blob | null
    text: string | null
}

export const unsuccessfulAsError: MonoTypeOperatorFunction<Response> = map(value => {
    if (!value.ok) throw new HttpResponseException(value)
    return value
})

export class HttpResponseException extends Error {
    public readonly response: Response;
    public readonly cause?: Error;

    public constructor(response: Response, cause?: Error) {
        super(`Got code ${response.status}`);
        this.response = response;
        this.cause = cause
    }
}

export class HttpReadResponseException extends Error {
    public readonly response: Response;
    public readonly text: string;

    public constructor(response: Response, text: string) {
        super(`Got code ${response.status}`);
        this.response = response;
        this.text = text;
    }
}

// export function headersToMap(headers: Headers): Map<string, string> {
//     return new Map(headers)
// }

export enum HttpPhase {
    Connect = "Connect",
    Write = "Write",
    Waiting = "Waiting",
    Read = "Read",
    Done = "Done"
}

export interface HttpProgress<T> {
    phase: HttpPhase
    ratio: number
    response: T | null
}

export function approximateProgress(progress: HttpProgress<any>): number {
    switch (progress.phase) {
        case HttpPhase.Connect:
            return 0
        case HttpPhase.Write:
            return 0.15 + 0.5 * progress.ratio
        case HttpPhase.Waiting:
            return 0.65
        case HttpPhase.Read:
            return 0.7 + 0.3 * progress.ratio
        case HttpPhase.Done:
            return 1
    }
}

export interface HttpOptions {
    timeout: number
    cacheMode: RequestCache;
}

export type HttpBody = Blob | FormData

export class HttpClient {
    public static INSTANCE = new HttpClient();

    public readonly GET = "GET";
    public readonly POST = "POST";
    public readonly PUT = "PUT";
    public readonly PATCH = "PATCH";
    public readonly DELETE = "DELETE";

    //--- HttpClient.ioScheduler
    public ioScheduler: SchedulerLike | null = null

    //--- HttpClient.responseScheduler
    public responseScheduler: SchedulerLike | null = null

    public defaultOptions: HttpOptions = {timeout: 30000, cacheMode: "default"};

    call(
        url: string,
        method: string = HttpClient.INSTANCE.GET,
        headers: Map<string, string> = new Map([]),
        body: (HttpBody | null) = null,
        options: HttpOptions = this.defaultOptions
    ): Observable<Response> {
        let h = new Array(...headers.entries());
        return from(fetch(url, {
            body: body,
            cache: options.cacheMode,
            credentials: "omit",
            headers: h,
            method: method
        })).pipe(timeout(options.timeout)) as Observable<Response>
    }

    callWithProgress<T>(
        url: string,
        method: string = HttpClient.INSTANCE.GET,
        headers: Map<string, string> = new Map([]),
        body: (HttpBody | null) = null,
        options: HttpOptions = this.defaultOptions,
        parse: (response: Response) => Observable<T>
    ): Observable<HttpProgress<T>> {
        return this.call(url, method, headers, body, options).pipe(mergeMap(parse), map(x => ({
            phase: HttpPhase.Done,
            ratio: 1,
            response: x
        })), shareReplay(1))
    }

    webSocket(url: string): Observable<ConnectedWebSocket> {
        return using(
            () => new ConnectedWebSocket(url),
            (r) => (r as ConnectedWebSocket).ownConnection
        )
    }
}

export interface WebSocketInterface {
    readonly write: Observer<WebSocketFrame>
    readonly read: Observable<WebSocketFrame>
    readonly ownConnection: Observable<ConnectedWebSocket>
}

export class ConnectedWebSocket implements WebSocketInterface, Unsubscribable {
    public static implementsInterfaceIoReactivexObserver = true;
    public static debug: boolean = false
    public readonly url: string;
    private readonly debugUrl: string;

    public constructor(url: string) {
        this.url = url;
        let index = url.indexOf("?")
        if (index === -1) index = url.length
        this.debugUrl = url.substring(0, index)
        this.resetSocket();
    }

    underlyingSocket: (WebSocket | null) = null;

    private resetSocket() {
        this.underlyingSocket?.close(1000, "Resetting connection");
        const newSocket = new WebSocket(this.url);
        const parent = this;
        newSocket.binaryType = "blob";
        newSocket.addEventListener("open", (event) => {
            if (ConnectedWebSocket.debug) {
                console.log(`Socket to ${this.debugUrl} opened`)
            }
            parent.ownConnection.next(this);
        });
        newSocket.addEventListener("error", (event) => {
            if (!closed) {
                if (ConnectedWebSocket.debug) {
                    console.log(`Socket to ${this.debugUrl} errored with event `, event)
                }
                this.closed = true;
                parent.ownConnection.error(event);
                parent.read.error(event);
            }
        });
        newSocket.addEventListener("close", (event) => {
            if (!closed) {
                if (ConnectedWebSocket.debug) {
                    console.log(`Socket to ${this.debugUrl} shut down with event `, event)
                }
                this.closed = true;
                if (event.code == 1000) {
                    parent.ownConnection.complete();
                    parent.read.complete();
                } else {
                    parent.ownConnection.error(event);
                    parent.read.error(event);
                }
            }
        });
        newSocket.addEventListener("message", (event: MessageEvent) => {
            const d = event.data;
            if (typeof d === "string") {
                if (ConnectedWebSocket.debug) {
                    console.log(`Socket to ${this.debugUrl} got `, d)
                }
                parent.read.next({binary: null, text: d});
            } else {
                parent.read.next({binary: d as Blob, text: null})
            }
        });
        this.underlyingSocket = newSocket;
    }

    public readonly read: Subject<WebSocketFrame> = new Subject();
    public readonly ownConnection = new Subject<ConnectedWebSocket>();

    closed: boolean = false;
    write: Observer<WebSocketFrame> = ((): Observer<WebSocketFrame> => {
        const upper = this
        return {
            complete() {
                upper.underlyingSocket?.close(1000, undefined);
                upper.closed = true;
            },
            next(t: WebSocketFrame) {
                upper.underlyingSocket?.send(t.text ?? t.binary!)
            },
            error(e: any) {
                if (!upper.closed) {
                    upper.ownConnection.error(e);
                    upper.read.error(e);
                    upper.underlyingSocket?.close(3000, e.message);
                    upper.closed = true;
                }
            }
        }
    })()

    public unsubscribe() {
        this.write.complete()
    }
}

export function fromJSON<TYPE>(type: Array<any>): OperatorFunction<Response, TYPE> {
    return pipe(switchMap(x => from(x.json())), map(x => parseObject<TYPE>(x, type)), shareReplay(1))
}

export namespace HttpBody {
    export function json<T>(value: T): Blob {
        return new Blob([JSON.stringify(value)], {type: 'application/json'})
    }

    export type MultipartBodyPart = []

    export function multipart(...parts: Array<[string, Blob, string?] | [string, string]>): Blob | FormData {
        const data = new FormData()
        for (const part of parts) {
            if (typeof part[1] === "string") {
                data.append(part[0], part[1])
            } else {
                data.append(part[0], part[1], part[2])
            }
        }
        return data
    }
}

export type ReifiedType<T = unknown> = Array<any>

export namespace JSON2 {
    export function parse<TYPE>(text: string, asType: ReifiedType<TYPE>): TYPE {
        return parseObject(JSON.parse(text), asType)
    }
}

export function parseObject<TYPE>(item: any, asType: ReifiedType<TYPE>): TYPE {
    if (item === undefined) return undefined as unknown as TYPE
    if (item === null) return null as unknown as TYPE
    switch (asType[0]) {
        case String:
        case Number:
        case Boolean:
            return item
        case Date:
            return new Date(item as string) as unknown as TYPE;
        case Array:
            return (item as Array<any>).map(x => parseObject(x, asType[1])) as unknown as TYPE
        case Set:
            return new Set((item as Array<any>).map(x => parseObject(x, asType[1]))) as unknown as TYPE
        case Map:
            let asObj = item as object;
            let map = new Map<any, any>();
            if (asType[1] === String) {
                for (const key of Object.keys(asObj)) {
                    map.set(key, parseObject((asObj as any)[key], asType[2]));
                }
            } else {
                for (const key of Object.keys(asObj)) {
                    map.set(parseObject(key, asType[1]), parseObject((asObj as any)[key], asType[2]));
                }
            }
            return map as unknown as TYPE;
    }
    const parser = asType[0].fromJSON as (item: any, typeArguments: Array<ReifiedType>) => any
    if (typeof parser !== "function") {
        throw Error(`Type ${asType[0]} has no function fromJSON!`)
    }
    return parser(item, asType.slice(1))
}

(Map.prototype as any).toJSON = function (this: Map<any, any>) {
    return Object.fromEntries(this)
};
(Set.prototype as any).toJSON = function (this: Map<any, any>) {
    return [...this]
};
