import {VirtualProperty} from "./binding";

export const elementEnabled: VirtualProperty<HTMLElement & { disabled: boolean }, boolean> = {
    get(receiver: HTMLElement & { disabled: boolean }): boolean {
        return !receiver.disabled;
    }, set(receiver: HTMLElement & { disabled: boolean }, value: boolean): any {
        receiver.disabled = !value;
    }
}