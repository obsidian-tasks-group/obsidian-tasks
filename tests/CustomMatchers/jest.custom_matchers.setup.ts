declare global {
    interface HTMLElement {
        addClass(className: string): this;
        addClasses(classNames: string[]): this;
        createDiv(
            options?: string | { attr?: Record<string, string | boolean>; cls?: string | string[]; text?: string },
        ): HTMLDivElement;
        createEl<K extends keyof HTMLElementTagNameMap>(
            tagName: K,
            options?: { attr?: Record<string, string | boolean>; cls?: string | string[]; text?: string },
        ): HTMLElementTagNameMap[K];
        empty(): void;
        removeClass(className: string): this;
        setText(text: string | DocumentFragment): this;
    }

    interface DocumentFragment {
        createDiv(
            options?: string | { attr?: Record<string, string | boolean>; cls?: string | string[]; text?: string },
        ): HTMLDivElement;
        createEl<K extends keyof HTMLElementTagNameMap>(
            tagName: K,
            options?: { attr?: Record<string, string | boolean>; cls?: string | string[]; text?: string },
        ): HTMLElementTagNameMap[K];
    }
}

type ObsidianElementOptions =
    | string
    | {
          attr?: Record<string, string | boolean>;
          cls?: string | string[];
          text?: string;
      }
    | undefined;

function applyObsidianElementOptions<T extends HTMLElement>(element: T, options: ObsidianElementOptions): T {
    if (typeof options === 'string') {
        element.classList.add(options);
        return element;
    }

    if (typeof options?.cls === 'string') {
        element.classList.add(options.cls);
    } else if (Array.isArray(options?.cls)) {
        element.classList.add(...options.cls);
    }

    if (options?.text) {
        element.setText(options.text);
    }

    if (options?.attr) {
        for (const [name, value] of Object.entries(options.attr)) {
            element.toggleAttribute(name, Boolean(value));
            if (typeof value === 'string') {
                element.setAttribute(name, value);
            }
        }
    }

    return element;
}

function defineMissingMethod(target: Record<string, any>, name: string, value: any) {
    if (!(name in target)) {
        Object.defineProperty(target, name, {
            value,
            configurable: true,
            writable: true,
        });
    }
}

defineMissingMethod(
    HTMLElement.prototype as Record<string, any>,
    'addClass',
    function (this: HTMLElement, className: string) {
        this.classList.add(className);
        return this;
    },
);

defineMissingMethod(
    HTMLElement.prototype as Record<string, any>,
    'addClasses',
    function (this: HTMLElement, classNames: string[]) {
        this.classList.add(...classNames);
        return this;
    },
);

defineMissingMethod(
    HTMLElement.prototype as Record<string, any>,
    'removeClass',
    function (this: HTMLElement, className: string) {
        this.classList.remove(className);
        return this;
    },
);

defineMissingMethod(HTMLElement.prototype as Record<string, any>, 'empty', function (this: HTMLElement) {
    this.replaceChildren();
});

defineMissingMethod(
    HTMLElement.prototype as Record<string, any>,
    'setText',
    function (this: HTMLElement, text: string | DocumentFragment) {
        this.empty();
        if (typeof text === 'string') {
            this.textContent = text;
        } else {
            this.append(text);
        }
        return this;
    },
);

defineMissingMethod(HTMLElement.prototype as Record<string, any>, 'createEl', function <
    K extends keyof HTMLElementTagNameMap,
>(this: HTMLElement, tagName: K, options?: { attr?: Record<string, string | boolean>; cls?: string | string[]; text?: string }): HTMLElementTagNameMap[K] {
    const element = applyObsidianElementOptions(document.createElement(tagName), options) as HTMLElementTagNameMap[K];
    this.appendChild(element);
    return element as HTMLElementTagNameMap[K];
});

defineMissingMethod(HTMLElement.prototype, 'createDiv', function (this: HTMLElement, options?: ObsidianElementOptions) {
    return this.createEl('div', typeof options === 'string' ? { cls: options } : options);
});

defineMissingMethod(DocumentFragment.prototype as Record<string, any>, 'createEl', function <
    K extends keyof HTMLElementTagNameMap,
>(this: DocumentFragment, tagName: K, options?: { attr?: Record<string, string | boolean>; cls?: string | string[]; text?: string }): HTMLElementTagNameMap[K] {
    const element = applyObsidianElementOptions(document.createElement(tagName), options) as HTMLElementTagNameMap[K];
    this.appendChild(element);
    return element;
});

defineMissingMethod(
    DocumentFragment.prototype as Record<string, any>,
    'createDiv',
    function (this: DocumentFragment, options?: ObsidianElementOptions) {
        return this.createEl('div', typeof options === 'string' ? { cls: options } : options);
    },
);

class MockResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

(globalThis as typeof globalThis & { ResizeObserver: typeof MockResizeObserver }).ResizeObserver = MockResizeObserver;

// ---------------------------------------------------------------------
// CustomMatchersForDates
// ---------------------------------------------------------------------
import { toEqualMoment } from './CustomMatchersForDates';
expect.extend({
    toEqualMoment,
});

// ---------------------------------------------------------------------
// CustomMatchersForExpressions
// ---------------------------------------------------------------------
import { toEvaluateAs } from './CustomMatchersForExpressions';
expect.extend({
    toEvaluateAs,
});

// ---------------------------------------------------------------------
// CustomMatchersForFilters
// ---------------------------------------------------------------------
import {
    toBeValid,
    toHaveExplanation,
    toMatchTask,
    toMatchTaskFromLine,
    toMatchTaskInTaskList,
    toMatchTaskWithDescription,
    toMatchTaskWithHeading,
    toMatchTaskWithPath,
    toMatchTaskWithSearchInfo,
    toMatchTaskWithStatus,
} from './CustomMatchersForFilters';
expect.extend({
    toBeValid,
    toHaveExplanation,
    toMatchTaskInTaskList,
    toMatchTask,
    toMatchTaskFromLine,
    toMatchTaskWithDescription,
    toMatchTaskWithHeading,
    toMatchTaskWithPath,
    toMatchTaskWithSearchInfo,
    toMatchTaskWithStatus,
});

// ---------------------------------------------------------------------
// CustomMatchersForGrouping
// ---------------------------------------------------------------------
import { groupHeadingsToBe, toSupportGroupingWithProperty } from './CustomMatchersForGrouping';
expect.extend({
    groupHeadingsToBe,
    toSupportGroupingWithProperty,
});

// ---------------------------------------------------------------------
// CustomMatchersForRendering
// ---------------------------------------------------------------------
import {
    toHaveAChildSpanWithClass,
    toHaveAChildSpanWithClassAndDataAttributes,
    toHaveAmongDataAttributes,
    toHaveDataAttributes,
} from './CustomMatchersForRendering';
expect.extend({
    toHaveAChildSpanWithClass,
    toHaveAChildSpanWithClassAndDataAttributes,
    toHaveAmongDataAttributes,
    toHaveDataAttributes,
});

// ---------------------------------------------------------------------
// CustomMatchersForTaskBuilder
// ---------------------------------------------------------------------
import { toBeIdenticalTo } from './CustomMatchersForTaskBuilder';
expect.extend({
    toBeIdenticalTo,
});

// ---------------------------------------------------------------------
// CustomMatchersForTasks
// ---------------------------------------------------------------------
import { toMatchMarkdownLines, toToggleTo, toToggleWithRecurrenceInUsersOrderTo } from './CustomMatchersForTasks';
expect.extend({
    toMatchMarkdownLines,
    toToggleTo,
    toToggleWithRecurrenceInUsersOrderTo,
});

// ---------------------------------------------------------------------
// CustomMatchersForTaskBuilder
// ---------------------------------------------------------------------
import { toMatchTaskDetails } from './CustomMatchersForTaskSerializer';
expect.extend({
    toMatchTaskDetails,
});
