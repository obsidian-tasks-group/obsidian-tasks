import { EnableJsInTasksQueries } from '../src/Config/EnableJsInTasksQueries';
import { InMemoryLocalStorageProvider } from '../src/Config/InMemoryLocalStorageProvider';
import { initializeI18n } from '../src/i18n/i18n';
import type { CreateDivOptions, CreateElOptions } from './TestingTools/DOMExtensions';

/**
 * Provide the minimal Obsidian-style createEl() behaviour in Jest:
 * create the requested element, append it to the parent, and return it.
 *
 * This is a partial re-implementation of:
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/Node/createEl/.
 *
 * See also the following, which is not yet supported in tests:
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/functions/createEl/
 */
if (HTMLElement.prototype.createEl === undefined) {
    HTMLElement.prototype.createEl = function <K extends keyof HTMLElementTagNameMap>(
        this: HTMLElement,
        tag: K,
        o?: CreateElOptions,
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
 *
 * This is a partial re-implementation of
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/Node/createDiv/.
 *
 * See also the following, which is not yet supported in tests:
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/functions/createDiv/ */
if (HTMLElement.prototype.createDiv === undefined) {
    HTMLElement.prototype.createDiv = function (this: HTMLElement, o?: CreateDivOptions): HTMLDivElement {
        const div = this.createEl('div', o);

        if (o?.text !== undefined) {
            div.textContent = o.text;
        }

        return div;
    };
}

// Tests should default to allowing JavaScript in Tasks queries.
// Production code initialises this singleton separately in main.ts, using Obsidian local storage.
EnableJsInTasksQueries.initialise(new InMemoryLocalStorageProvider());
EnableJsInTasksQueries.getInstance().set(true);

beforeAll(async () => {
    await initializeI18n();
});
