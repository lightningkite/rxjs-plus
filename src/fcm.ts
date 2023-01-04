import { getMessaging, getToken, onMessage, MessagePayload, Messaging } from "firebase/messaging"
import {BehaviorSubject} from "rxjs";
import {showDialog} from "./viewGenerator";
import { initializeApp, FirebaseOptions } from "firebase/app";
import firebase from "firebase/compat";


interface PayloadNotification extends NotificationOptions {
    title: string
}

function checkNotificationPromise() {
    try {
        Notification.requestPermission().then();
    } catch (e) {
        return false;
    }

    return true;
}

export class Notifications {
    static INSTANCE = new Notifications();
    notificationToken = new BehaviorSubject<string | null>(null);
    handler: ForegroundNotificationHandler | null = null
    fcmPublicKey?: string
    additionalMessageListener: (payload: MessagePayload) => void = () => {
    }
    serviceWorkerLocation?: string

    constructor() {
        (window as any).Notifications = this
    }

    initialize(rootVg: ForegroundNotificationHandler, fcmPublicKey: string, fcmAppConfig: FirebaseOptions): Messaging {
        const fcmApp = initializeApp(fcmAppConfig)

        Notifications.INSTANCE.handler = rootVg as ForegroundNotificationHandler
        if (fcmPublicKey) {
            Notifications.INSTANCE.fcmPublicKey = fcmPublicKey;
        }

        return getMessaging(fcmApp)
    }

    configure(dependency: Window){
        this.request()
    }

    payloadReceived(payload: MessagePayload): ForegroundNotificationHandlerResult {
        this.additionalMessageListener(payload);
        let data: Map<string, string>;
        let payData = payload.data;
        if (payData) {
            data = new Map(Object.entries(payData))
        } else {
            data = new Map();
        }

        let handledState = this.handler?.handleNotificationInForeground(data);
        if (handledState != ForegroundNotificationHandlerResult.SuppressNotification && payload.notification) {
            new Notification(payload.notification.title ?? "Notification", payload.notification)
        }
        return handledState ?? ForegroundNotificationHandlerResult.Unhandled
    }
    request(insistMessage: string | null = null, onResult: (success: boolean) => void = () => {}) {
        let onBrowserResult = (x: NotificationPermission) => {
            if (x == "granted") {
                onResult(true)
                const messaging = getMessaging()

                let getTokenLambda = (serviceWorkerRegistration?: ServiceWorkerRegistration) => {
                    return getToken(messaging, {
                        vapidKey: this.fcmPublicKey,
                        serviceWorkerRegistration: serviceWorkerRegistration
                    })
                }

                (this.serviceWorkerLocation ? navigator.serviceWorker.register(this.serviceWorkerLocation)
                    .then((x) => getTokenLambda(x)) : getTokenLambda())
                    .then((value) => {
                        Notifications.INSTANCE.notificationToken.next(value);
                    })
                    .catch((err) => {
                        console.warn('Unable to retrieve refreshed token ', err);
                    });
                onMessage(messaging, (payload: MessagePayload) => {
                    this.payloadReceived(payload)
                });
            } else {
                onResult(false)
            }
        }
        switch (Notification.permission) {
            case "granted":
                onBrowserResult("granted")
                break
            case "denied":
                this.ask(onBrowserResult)
                break
            default:
                this.ask(onBrowserResult)
        }
    }

    private ask(onBrowserResult: (x: NotificationPermission) => void) {
        showDialog({
            _string: "Please allow notifications",
            confirmation: () => {
                if (checkNotificationPromise()) {
                    Notification.requestPermission().then(onBrowserResult).catch(err => console.error(err));
                } else {
                    Notification.requestPermission(onBrowserResult);
                }
            }
        })
    }
}

export interface ForegroundNotificationHandler {
    handleNotificationInForeground(map: Map<string, string>): ForegroundNotificationHandlerResult
}
export namespace ForegroundNotificationHandlerDefaults {
    export function handleNotificationInForeground(this_: ForegroundNotificationHandler, map: Map<string, string>): ForegroundNotificationHandlerResult {
        return ForegroundNotificationHandlerResult.ShowNotification;
    }
}

export class ForegroundNotificationHandlerResult {
    private constructor(name: string, jsonName: string) {
        this.name = name;
        this.jsonName = jsonName;
    }

    public static SuppressNotification = new ForegroundNotificationHandlerResult("SuppressNotification", "SuppressNotification");
    public static ShowNotification = new ForegroundNotificationHandlerResult("ShowNotification", "ShowNotification");
    public static Unhandled = new ForegroundNotificationHandlerResult("Unhandled", "Unhandled");

    private static _values: Array<ForegroundNotificationHandlerResult> = [ForegroundNotificationHandlerResult.SuppressNotification, ForegroundNotificationHandlerResult.ShowNotification, ForegroundNotificationHandlerResult.Unhandled];
    public static values(): Array<ForegroundNotificationHandlerResult> { return ForegroundNotificationHandlerResult._values; }
    public readonly name: string;
    public readonly jsonName: string;
    public static valueOf(name: string): ForegroundNotificationHandlerResult { return (ForegroundNotificationHandlerResult as any)[name]; }
    public toString(): string { return this.name }
    public toJSON(): string { return this.jsonName }
    public static fromJSON(key: string): ForegroundNotificationHandlerResult { return ForegroundNotificationHandlerResult._values.find(x => x.jsonName.toLowerCase() === key.toLowerCase())! }
}
