import {
    from,
    map,
    mergeMap,
    MonoTypeOperatorFunction,
    Observable,
    Observer, OperatorFunction,
    SchedulerLike, Subject, switchMap,
    timeout,
    Unsubscribable, using
} from "rxjs";
import {CompositeDisposable} from "./binding";

export interface WebSocketFrame {
    binary?: Blob
    text?: string
}

export const unsuccessfulAsError: MonoTypeOperatorFunction<Response> = map(value => {
    if(!value.ok) throw new HttpResponseException(value)
    return value
})

export class HttpResponseException extends Error {
    public readonly response: Response;

    public constructor(response: Response) {
        super(`Got code ${response.status}`);
        this.response = response;
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
    switch(progress.phase) {
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

export interface HttpBody {
    data: BodyInit,
    type: string
}

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

    public defaultOptions: HttpOptions = { timeout: 30000, cacheMode: "default" };

    call(
        url: string,
        method: string = HttpClient.INSTANCE.GET,
        headers: Map<string, string> = new Map([]),
        body: (HttpBody | null) = null,
        options: HttpOptions = this.defaultOptions
    ): Observable<Response> {
        let h = new Array(...headers.entries());
        if(body !== null && body.type !== "multipart/form-data"){
            h.push(["Content-Type", body.type]);
        }
        return from(fetch(url, {
            body: body?.data,
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
        })))
    }

    webSocket(url: string): Observable<ConnectedWebSocket>{
        return using(
            ()=> new ConnectedWebSocket(url),
            (r) => (r as ConnectedWebSocket).ownConnection
        )
    }
}

export interface WebSocketInterface extends Observer<WebSocketFrame> {
    readonly read: Observable<WebSocketFrame>
    readonly ownConnection: Observable<ConnectedWebSocket>
}

export class ConnectedWebSocket implements Observer<WebSocketFrame>, WebSocketInterface, Unsubscribable {
    public static implementsInterfaceIoReactivexObserver = true;
    public readonly url: string;
    public constructor(url: string) {
        this.url = url;
        this.resetSocket();
    }

    underlyingSocket: (WebSocket | null) = null;

    private resetSocket(){
        this.underlyingSocket?.close(1000, "Resetting connection");
        const newSocket = new WebSocket(this.url);
        const parent = this;
        newSocket.binaryType = "blob";
        newSocket.addEventListener("open", (event)=>{
            parent.ownConnection.next(this);
        });
        newSocket.addEventListener("error", (event)=>{
            if(!closed) {
                this.closed = true;
                parent.ownConnection.error(event);
                parent.read.error(event);
            }
        });
        newSocket.addEventListener("close", (event)=>{
            if(!closed) {
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
        newSocket.addEventListener("message", (event: MessageEvent)=>{
            const d = event.data;
            if(typeof d === "string"){
                parent.read.next({ text: d });
            } else {
                parent.read.next( { binary: d as Blob } )
            }
        });
        this.underlyingSocket = newSocket;
    }

    public readonly read: Subject<WebSocketFrame> = new Subject();
    public readonly ownConnection = new Subject<ConnectedWebSocket>();

    closed: boolean = false;

    public complete() {
        this.underlyingSocket?.close(1000, undefined);
        this.closed = true;
    }

    public next(t: WebSocketFrame) {
        this.underlyingSocket?.send(t.text ?? t.binary!)
    }

    public error(e: any) {
        if(!closed){
            this.ownConnection.error(e);
            this.read.error(e);
            this.underlyingSocket?.close(3000, e.message);
            this.closed = true;
        }
    }

    public unsubscribe() {
        this.complete();
    }
}


export function parse<TYPE>(item: any, asType: Array<any>): TYPE {
    const parser = asType[0].fromJSON as (item: any, typeArguments: Array<any>) => any
    return parser(item, asType.slice(1))
}

export function parseUntyped(json: string): any {
    return JSON.parse(json, function(key, value) {
        if(typeof value === 'object' && value !== null){
            return new Map(Object.entries(value));
        } else {
            return value;
        }
    })
}

(String as any).fromJSON = (value: any) => value;
(Number as any).fromJSON = (value: any) => typeof value === "string" ? parseFloat(value) : value;
(Boolean as any).fromJSON = (value: any) => typeof value === "string" ? value === "true" : value;
(Array as any).fromJSON = (value: any, typeArguments: Array<any>) => { return (value as Array<any>).map(x => parse(x, [typeArguments[0]])) };
(Map as any).fromJSON = (value: any, typeArguments: Array<any>) => {
    let asObj = value as object;
    let map = new Map<any, any>();
    if (typeArguments[0] === String) {
        for (const key of Object.keys(asObj)) {
            map.set(key, parse((asObj as any)[key], typeArguments[1]));
        }
    } else {
        for (const key of Object.keys(asObj)) {
            map.set(parse(key, typeArguments[0]), parse((asObj as any)[key], typeArguments[1]));
        }
    }
    return map;
};
(Date as any).fromJSON = (value: any) => new Date(value as string);
(Map as any).toJSON = (value: Map<any, any>) => Object.fromEntries(value);

export function fromJSON<TYPE>(type: Array<any>): OperatorFunction<Response, TYPE> {
    return (response: Observable<Response>) => response.pipe(switchMap(Response.prototype.json), map(x => parse<TYPE>(x, type)))
}

function asdfasdf(response: Response){
    HttpClient.INSTANCE.call('https://test.com', HttpClient.INSTANCE.GET).pipe(fromJSON<Array<number>>([Array, [Number]]))
    response.blob()
}