/**
 * @jest-environment jsdom
 */
import type { HTMLElementWithCreateDiv, HTMLElementWithCreateEl, HTMLElementWithCreateSpan } from './DOMExtensions';

/**
 * Create a parent element typed for tests that exercise createEl().
 *
 * The choice of a <div> parent is arbitrary: these tests only care that
 * createEl() creates and appends a child to some HTMLElement parent.
 */
function createParentWithCreateEl(): HTMLElementWithCreateEl {
    return document.createElement('div') as HTMLElementWithCreateEl;
}

/**
 * Create a parent element typed for tests that exercise createDiv().
 *
 * The choice of a <section> parent is also arbitrary and is only used to
 * show that createDiv() works with any HTMLElement parent, not just <div>.
 */
function createParentWithCreateDiv(): HTMLElementWithCreateDiv {
    return document.createElement('section') as HTMLElementWithCreateDiv;
}

/**
 * Create a parent element typed for tests that exercise createSpan().
 */
function createParentWithCreateSpan(): HTMLElementWithCreateSpan {
    return document.createElement('span') as HTMLElementWithCreateSpan;
}

function expectCorrectTagNameAndParentChildStructure(parent: HTMLElement, child: HTMLElement, expectedTagName: string) {
    expect(child.tagName).toBe(expectedTagName);
    expect(parent.children).toHaveLength(1);
    expect(parent.firstElementChild).toBe(child);
}

function expectElementToHaveClasses(element: Element, expectedClasses: string[] | string) {
    const classes = Array.isArray(expectedClasses) ? expectedClasses : [expectedClasses];

    for (const className of classes) {
        expect(element.classList).toContain(className);
    }
}

describe('global createEl()', () => {
    it('createEl() should create an element and return it', () => {
        const child = createEl('input');

        expect(child.tagName).toBe('INPUT');
    });

    it('createEl() should treat a string second argument as a class name', () => {
        const child = createEl('p', 'single-class-value');

        expect(child.tagName).toBe('P');
        expectElementToHaveClasses(child, 'single-class-value');
    });

    it('createEl() should call the callback with the created element', () => {
        const callback = jest.fn();

        const child = createEl('button', undefined, callback);

        expect(child.tagName).toBe('BUTTON');
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(child);
    });
});

describe('HTMLElement.createEl()', () => {
    let parent: HTMLElementWithCreateEl;
    beforeEach(() => {
        parent = createParentWithCreateEl();
    });

    it('createEl() should create an element, append it to the parent, and return it', () => {
        // This documents the baseline behavior we rely on from Obsidian's createEl().
        const child = parent.createEl('input');

        expectCorrectTagNameAndParentChildStructure(parent, child, 'INPUT');
    });

    it('createEl() should treat a string second argument as a class name', () => {
        const child = parent.createEl('p', 'single-class-value');

        expect(child.tagName).toBe('P');
        expectElementToHaveClasses(child, 'single-class-value');
    });

    it('createEl() should apply the type option to an input element', () => {
        const child = parent.createEl('input', { type: 'checkbox' });

        expect(child.tagName).toBe('INPUT');
        expect(child.type).toBe('checkbox');
    });

    it('createEl() should apply classes from the cls option', () => {
        const child = parent.createEl('input', {
            cls: ['task-list-item-checkbox', 'tasks-quick-search-result-checkbox'],
        });

        expectElementToHaveClasses(child, ['task-list-item-checkbox', 'tasks-quick-search-result-checkbox']);
    });

    it('createEl() should apply a class from the cls option', () => {
        const child = parent.createEl('input', {
            cls: 'single-class-value',
        });

        expectElementToHaveClasses(child, 'single-class-value');
    });

    it('createEl() should call the callback with the created element', () => {
        const callback = jest.fn();

        const child = parent.createEl('button', undefined, callback);

        expect(child.tagName).toBe('BUTTON');
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(child);
    });
});

describe('global createDiv()', () => {
    it('createDiv() should create a div', () => {
        const child = createDiv();

        expect(child.tagName).toBe('DIV');
    });

    it('createDiv() should treat a string argument as a class name', () => {
        const div = createDiv('single-class-value');

        expect(div.tagName).toBe('DIV');
        expectElementToHaveClasses(div, 'single-class-value');
    });

    it('createDiv() should apply classes from the cls option', () => {
        const child = createDiv({
            cls: ['first-class', 'second-class'],
        });

        expectElementToHaveClasses(child, ['first-class', 'second-class']);
    });

    it('createDiv() should apply a class from the cls option', () => {
        const child = createDiv({
            cls: 'single-class-value',
        });

        expectElementToHaveClasses(child, 'single-class-value');
    });

    it('createDiv() should apply text from the text option', () => {
        const child = createDiv({
            text: 'example text content',
        });

        expect(child.textContent).toBe('example text content');
    });

    it('createDiv() should apply DocumentFragment text content', () => {
        const fragment = document.createDocumentFragment();
        const childSpan = document.createElement('span');
        childSpan.textContent = 'fragment text content';
        fragment.appendChild(childSpan);

        const child = createDiv({
            text: fragment,
        });

        expect(child.tagName).toBe('DIV');
        expect(child.childElementCount).toBe(1);
        expect(child.firstElementChild?.tagName).toBe('SPAN');
        expect(child.textContent).toBe('fragment text content');
    });

    it('createDiv() should apply both cls and text options', () => {
        const div = createDiv({
            cls: ['first-class', 'second-class'],
            text: 'example text content',
        });

        expectElementToHaveClasses(div, ['first-class', 'second-class']);
        expect(div.textContent).toBe('example text content');
    });

    it('createDiv() should call the callback with the created div', () => {
        const callback = jest.fn();

        const div = createDiv(undefined, callback);

        expect(div.tagName).toBe('DIV');
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(div);
    });

    it('createDiv() should apply text before calling the callback', () => {
        const callback = jest.fn();

        const div = createDiv({ text: 'example text content' }, callback);

        expect(div.textContent).toBe('example text content');
        expect(callback).toHaveBeenCalledWith(div);
        expect((callback.mock.calls[0][0] as HTMLDivElement).textContent).toBe('example text content');
    });
});

describe('HTMLElement.createDiv()', () => {
    let parent: HTMLElementWithCreateDiv;
    beforeEach(() => {
        parent = createParentWithCreateDiv();
    });

    it('createDiv() should create a div, append it to the parent, and return it', () => {
        const child = parent.createDiv();

        expectCorrectTagNameAndParentChildStructure(parent, child, 'DIV');
    });

    it('createDiv() should treat a string argument as a class name', () => {
        const div = parent.createDiv('single-class-value');

        expect(div.tagName).toBe('DIV');
        expectElementToHaveClasses(div, 'single-class-value');
    });

    it('createDiv() should apply classes from the cls option', () => {
        const child = parent.createDiv({
            cls: ['first-class', 'second-class'],
        });

        expectElementToHaveClasses(child, ['first-class', 'second-class']);
    });

    it('createDiv() should apply a class from the cls option', () => {
        const child = parent.createDiv({
            cls: 'single-class-value',
        });

        expectElementToHaveClasses(child, 'single-class-value');
    });

    it('createDiv() should apply text from the text option', () => {
        const child = parent.createDiv({
            text: 'example text content',
        });

        expect(child.textContent).toBe('example text content');
    });

    it('createDiv() should apply DocumentFragment text content', () => {
        const fragment = document.createDocumentFragment();
        const childSpan = document.createElement('span');
        childSpan.textContent = 'fragment text content';
        fragment.appendChild(childSpan);

        const child = parent.createDiv({
            text: fragment,
        });

        expectCorrectTagNameAndParentChildStructure(parent, child, 'DIV');
        expect(child.childElementCount).toBe(1);
        expect(child.firstElementChild?.tagName).toBe('SPAN');
        expect(child.textContent).toBe('fragment text content');
    });

    it('createDiv() should call the callback with the created div', () => {
        const callback = jest.fn();

        const div = parent.createDiv(undefined, callback);

        expect(div.tagName).toBe('DIV');
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(div);
    });
});

describe('global createSpan()', () => {
    it.failing('createSpan() should create a span', () => {
        const child = createSpan();

        expect(child.tagName).toBe('SPAN');
    });

    it.failing('createSpan() should treat a string argument as a class name', () => {
        const span = createSpan('single-class-value');

        expect(span.tagName).toBe('SPAN');
        expectElementToHaveClasses(span, 'single-class-value');
    });

    it.failing('createSpan() should call the callback with the created span', () => {
        const callback = jest.fn();

        const span = createSpan(undefined, callback);

        expect(span.tagName).toBe('SPAN');
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(span);
    });

    it.failing('createSpan() should apply a class from the cls option', () => {
        const span = createSpan({
            cls: 'single-class-value',
        });

        expect(span.tagName).toBe('SPAN');
        expectElementToHaveClasses(span, 'single-class-value');
    });
});

describe('HTMLElement.createSpan()', () => {
    it('createSpan() should create a span, append it to the parent, and return it', () => {
        const parent = createParentWithCreateSpan();

        const child = parent.createSpan();

        expectCorrectTagNameAndParentChildStructure(parent, child, 'SPAN');
    });
});
