import { EnableJsInTasksQueries } from '../src/Config/EnableJsInTasksQueries';
import { InMemoryLocalStorageProvider } from '../src/Config/InMemoryLocalStorageProvider';
import { initializeI18n } from '../src/i18n/i18n';
import type { CreateDivOptions, CreateElOptions, CreateSpanOptions } from './TestingTools/DOMExtensions';

// ------------------------------------------------------------------
// Mimics of Obsidian's createEl() implementations
// ------------------------------------------------------------------

function applyTextAndInvokeCallback<T extends HTMLElement>(
    element: T,
    options: { text?: string | DocumentFragment } | undefined,
    callback?: (el: T) => void,
): T {
    if (options?.text !== undefined) {
        if (typeof options.text === 'string') {
            element.textContent = options.text;
        } else {
            element.replaceChildren(options.text);
        }
    }

    callback?.(element);
    return element;
}

/**
 * Provide the minimal Obsidian-style createEl() behaviour in Jest:
 * create the requested element, append it to the parent, and return it.
 *
 * This is a partial re-implementation of:
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/functions/createEl/
 */
globalThis.createEl = function <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    o?: string | CreateElOptions,
    callback?: (el: HTMLElementTagNameMap[K]) => void,
): HTMLElementTagNameMap[K] {
    const options: CreateElOptions | undefined = typeof o === 'string' ? { cls: o } : o;
    const el = document.createElement(tag) as HTMLElementTagNameMap[K];

    if (options?.type !== undefined && el instanceof HTMLInputElement) {
        el.type = options.type;
    }

    if (options?.cls !== undefined) {
        const classes = Array.isArray(options.cls) ? options.cls : [options.cls];
        el.classList.add(...classes);
    }

    callback?.(el);
    return el;
};

/**
 * Provide the minimal Obsidian-style createEl() behaviour in Jest:
 * create the requested element, append it to the parent, and return it.
 *
 * This is a partial re-implementation of:
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/Node/createEl/.
 */
HTMLElement.prototype.createEl = function <K extends keyof HTMLElementTagNameMap>(
    this: HTMLElement,
    tag: K,
    o?: string | CreateElOptions,
    callback?: (el: HTMLElementTagNameMap[K]) => void,
): HTMLElementTagNameMap[K] {
    const el = createEl(tag, o, callback);

    this.appendChild(el);
    return el;
};

// ------------------------------------------------------------------
// Mimics of Obsidian's createDiv() implementations
// ------------------------------------------------------------------

/**
 * Provide the minimal Obsidian-style createDiv() behaviour in Jest
 * by delegating to createEl('div').
 *
 * See also the following, which is not yet supported in tests:
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/functions/createDiv/
 */
globalThis.createDiv = function (
    o?: string | CreateDivOptions,
    callback?: (el: HTMLDivElement) => void,
): HTMLDivElement {
    const options: CreateDivOptions | undefined = typeof o === 'string' ? { cls: o } : o;
    const div = createEl('div', options);
    return applyTextAndInvokeCallback(div, options, callback);
};

/**
 * Provide the minimal Obsidian-style createDiv() behaviour in Jest
 * for Document instances by delegating to createEl('div').
 *
 * Unlike HTMLElement.createDiv(), this does not append the new div anywhere.
 */
Document.prototype.createDiv = function (
    this: Document,
    o?: string | CreateDivOptions,
    callback?: (el: HTMLDivElement) => void,
): HTMLDivElement {
    return createDiv(o, callback);
};

/**
 * Provide the minimal Obsidian-style createDiv() behaviour in Jest
 * by delegating to createEl('div').
 *
 * This is a partial re-implementation of
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/Node/createDiv/.
 */
HTMLElement.prototype.createDiv = function (
    this: HTMLElement,
    o?: string | CreateDivOptions,
    callback?: (el: HTMLDivElement) => void,
): HTMLDivElement {
    const div = createDiv(o, callback);

    this.appendChild(div);
    return div;
};

// ------------------------------------------------------------------
// Mimics of Obsidian's createSpan() implementations
// ------------------------------------------------------------------

/**
 * Provide the minimal Obsidian-style createSpan() behaviour in Jest
 * by delegating to createEl('span').
 *
 * See also the following, which is not yet supported in tests:
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/functions/createSpan/
 */
globalThis.createSpan = function (
    o?: string | CreateDivOptions,
    callback?: (el: HTMLSpanElement) => void,
): HTMLSpanElement {
    const options: CreateDivOptions | undefined = typeof o === 'string' ? { cls: o } : o;
    const span = createEl('span', options);
    return applyTextAndInvokeCallback(span, options, callback);
};

/**
 * Provide the minimal Obsidian-style createSpan() behaviour in Jest
 * by delegating to createEl('span').
 *
 * This is a partial re-implementation of
 * https://obsidian-typings.github.io/obsidian-typings/public/api/globals/augmentations/Node/createSpan/.
 */
HTMLElement.prototype.createSpan = function (
    this: HTMLElement,
    o?: string | CreateSpanOptions,
    callback?: (el: HTMLSpanElement) => void,
): HTMLSpanElement {
    const span = createSpan(o, callback);

    this.appendChild(span);
    return span;
};

// ------------------------------------------------------------------
// Other global test code
// ------------------------------------------------------------------

// Tests should default to allowing JavaScript in Tasks queries.
// Production code initialises this singleton separately in main.ts, using Obsidian local storage.
EnableJsInTasksQueries.initialise(new InMemoryLocalStorageProvider());
EnableJsInTasksQueries.getInstance().set(true);

beforeAll(async () => {
    await initializeI18n();
});
