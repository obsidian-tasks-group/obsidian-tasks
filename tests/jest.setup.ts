import { EnableJsInTasksQueries } from '../src/Config/EnableJsInTasksQueries';
import { InMemoryLocalStorageProvider } from '../src/Config/InMemoryLocalStorageProvider';
import { initializeI18n } from '../src/i18n/i18n';

/**
 * Provide the minimal Obsidian-style createEl() behaviour in Jest:
 * create the requested element, append it to the parent, and return it.
 */
if (HTMLElement.prototype.createEl === undefined) {
    HTMLElement.prototype.createEl = function <K extends keyof HTMLElementTagNameMap>(
        this: HTMLElement,
        tag: K,
        o?: { type?: string; cls?: string[] | string },
    ): HTMLElementTagNameMap[K] {
        const el = document.createElement(tag) as HTMLElementTagNameMap[K];

        if (o?.type !== undefined && el instanceof HTMLInputElement) {
            el.type = o.type;
        }

        if (o?.cls !== undefined) {
            const classes = Array.isArray(o.cls) ? o.cls : [o.cls];
            el.classList.add(...classes);
        }

        this.appendChild(el);
        return el;
    };
}

/**
 * Provide the minimal Obsidian-style createDiv() behaviour in Jest
 * by delegating to createEl('div').
 */
if (HTMLElement.prototype.createDiv === undefined) {
    HTMLElement.prototype.createDiv = function (this: HTMLElement): HTMLDivElement {
        return this.createEl('div');
    };
}

// Tests should default to allowing JavaScript in Tasks queries.
// Production code initialises this singleton separately in main.ts, using Obsidian local storage.
EnableJsInTasksQueries.initialise(new InMemoryLocalStorageProvider());
EnableJsInTasksQueries.getInstance().set(true);

beforeAll(async () => {
    await initializeI18n();
});
