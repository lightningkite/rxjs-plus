
export interface ViewGenerator {
    readonly titleString: string
    generate(dependency: Window): HTMLElement
}
export namespace ViewGenerator {
    export class Default implements ViewGenerator {
        titleString: string = "";
        generate(dependency: Window): HTMLElement {
            return document.createElement("div");
        }
    }
}

