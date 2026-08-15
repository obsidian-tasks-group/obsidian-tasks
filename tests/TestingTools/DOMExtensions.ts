export type HTMLElementWithCreateEl = HTMLElement & {
    createEl<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        o?: { type?: string; cls?: string[] | string },
    ): HTMLElementTagNameMap[K];
};

export type HTMLElementWithCreateDiv = HTMLElement & {
    createDiv(o?: { cls?: string[] | string; text?: string }): HTMLDivElement;
};
