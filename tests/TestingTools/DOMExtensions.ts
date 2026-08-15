export type CreateElOptions = {
    type?: string;
    cls?: string[] | string;
};

export type CreateDivOptions = {
    cls?: string[] | string;
    text?: string;
};

export type HTMLElementWithCreateEl = HTMLElement & {
    createEl<K extends keyof HTMLElementTagNameMap>(tag: K, o?: CreateElOptions): HTMLElementTagNameMap[K];
};

export type HTMLElementWithCreateDiv = HTMLElement & {
    createDiv(o?: CreateDivOptions): HTMLDivElement;
};
