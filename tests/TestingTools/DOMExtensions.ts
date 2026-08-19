export type CreateElOptions = {
    type?: string;
    cls?: string[] | string;
};

export type CreateDivOptions = {
    cls?: string[] | string;
    text?: string | DocumentFragment;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- types will likely be added in future
export type CreateSpanOptions = {};

// See jest.setup.ts for the test implementations of these functions.
export type HTMLElementWithCreateEl = HTMLElement & {
    createEl<K extends keyof HTMLElementTagNameMap>(tag: K, o?: string | CreateElOptions): HTMLElementTagNameMap[K];
};

export type HTMLElementWithCreateDiv = HTMLElement & {
    createDiv(o?: CreateDivOptions): HTMLDivElement;
};

export type HTMLElementWithCreateSpan = HTMLElement & {
    createSpan(o?: CreateSpanOptions): HTMLSpanElement;
};
