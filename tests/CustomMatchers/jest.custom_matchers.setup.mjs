/* eslint-disable no-undef */
// Native ESM setup file — bypasses ts-jest compilation entirely.
// .mjs is always ESM, so no CJS/ESM mismatch on any platform.
import { jest } from '@jest/globals';

globalThis.jest = jest;

function applyObsidianElementOptions(element, options) {
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

function defineMissingMethod(target, name, value) {
    if (!(name in target)) {
        Object.defineProperty(target, name, { value, configurable: true, writable: true });
    }
}

defineMissingMethod(HTMLElement.prototype, 'addClass', function (className) {
    this.classList.add(className);
    return this;
});
defineMissingMethod(HTMLElement.prototype, 'addClasses', function (classNames) {
    this.classList.add(...classNames);
    return this;
});
defineMissingMethod(HTMLElement.prototype, 'removeClass', function (className) {
    this.classList.remove(className);
    return this;
});
defineMissingMethod(HTMLElement.prototype, 'empty', function () {
    this.replaceChildren();
});
defineMissingMethod(HTMLElement.prototype, 'setText', function (text) {
    this.empty();
    if (typeof text === 'string') {
        this.textContent = text;
    } else {
        this.append(text);
    }
    return this;
});
defineMissingMethod(HTMLElement.prototype, 'createEl', function (tagName, options) {
    const element = applyObsidianElementOptions(document.createElement(tagName), options);
    this.appendChild(element);
    return element;
});
defineMissingMethod(HTMLElement.prototype, 'createDiv', function (options) {
    return this.createEl('div', typeof options === 'string' ? { cls: options } : options);
});
defineMissingMethod(DocumentFragment.prototype, 'createEl', function (tagName, options) {
    const element = applyObsidianElementOptions(document.createElement(tagName), options);
    this.appendChild(element);
    return element;
});
defineMissingMethod(DocumentFragment.prototype, 'createDiv', function (options) {
    return this.createEl('div', typeof options === 'string' ? { cls: options } : options);
});

class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
globalThis.ResizeObserver = MockResizeObserver;

// Custom matchers — ESM imports, transformed by ts-jest
import { toEqualMoment } from './CustomMatchersForDates';
expect.extend({ toEqualMoment });

import { toEvaluateAs } from './CustomMatchersForExpressions';
expect.extend({ toEvaluateAs });

import {
    toBeValid, toHaveExplanation, toMatchTask, toMatchTaskFromLine,
    toMatchTaskInTaskList, toMatchTaskWithDescription, toMatchTaskWithHeading,
    toMatchTaskWithPath, toMatchTaskWithSearchInfo, toMatchTaskWithStatus,
} from './CustomMatchersForFilters';
expect.extend({
    toBeValid, toHaveExplanation, toMatchTaskInTaskList, toMatchTask,
    toMatchTaskFromLine, toMatchTaskWithDescription, toMatchTaskWithHeading,
    toMatchTaskWithPath, toMatchTaskWithSearchInfo, toMatchTaskWithStatus,
});

import { groupHeadingsToBe, toSupportGroupingWithProperty } from './CustomMatchersForGrouping';
expect.extend({ groupHeadingsToBe, toSupportGroupingWithProperty });

import {
    toHaveAChildSpanWithClass, toHaveAChildSpanWithClassAndDataAttributes,
    toHaveAmongDataAttributes, toHaveDataAttributes,
} from './CustomMatchersForRendering';
expect.extend({
    toHaveAChildSpanWithClass, toHaveAChildSpanWithClassAndDataAttributes,
    toHaveAmongDataAttributes, toHaveDataAttributes,
});

import { toBeIdenticalTo } from './CustomMatchersForTaskBuilder';
expect.extend({ toBeIdenticalTo });

import { toMatchMarkdownLines, toToggleTo, toToggleWithRecurrenceInUsersOrderTo } from './CustomMatchersForTasks';
expect.extend({ toMatchMarkdownLines, toToggleTo, toToggleWithRecurrenceInUsersOrderTo });

import { toMatchTaskDetails } from './CustomMatchersForTaskSerializer';
expect.extend({ toMatchTaskDetails });
