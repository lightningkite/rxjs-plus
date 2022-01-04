import {
    from,
    map,
    mergeMap,
    MonoTypeOperatorFunction,
    Observable,
    Observer,
    SchedulerLike, Subject,
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

export class ConnectedWebSocket implements Observer<WebSocketFrame>, Unsubscribable {
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
