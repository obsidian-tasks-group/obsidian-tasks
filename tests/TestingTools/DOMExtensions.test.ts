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
    it('createEl() should create an element, append it to the parent, and return it', () => {
        const parent = createParentWithCreateEl();

        // This documents the baseline behavior we rely on from Obsidian's createEl().
        const child = parent.createEl('input');

        expectCorrectTagNameAndParentChildStructure(parent, child, 'INPUT');
    });

    it('createEl() should apply the type option to an input element', () => {
        const parent = createParentWithCreateEl();

        const child = parent.createEl('input', { type: 'checkbox' });

        expect(child.tagName).toBe('INPUT');
        expect(child.type).toBe('checkbox');
    });

    it('createEl() should apply classes from the cls option', () => {
        const parent = createParentWithCreateEl();

        const child = parent.createEl('input', {
            cls: ['task-list-item-checkbox', 'tasks-quick-search-result-checkbox'],
        });

        expectElementToHaveClasses(child, ['task-list-item-checkbox', 'tasks-quick-search-result-checkbox']);
    });

    it('createEl() should apply a class from the cls option', () => {
        const parent = createParentWithCreateEl();

        const child = parent.createEl('input', {
            cls: 'single-class-value',
        });

        expectElementToHaveClasses(child, 'single-class-value');
    });
});

describe('global createDiv()', () => {
    it.failing('createDiv() should create a div', () => {
        const child = createDiv();

        expect(child.tagName).toBe('DIV');
    });

    it.failing('createDiv() should treat a string argument as a class name', () => {
        const div = createDiv('single-class-value');

        expect(div.tagName).toBe('DIV');
        expectElementToHaveClasses(div, 'single-class-value');
    });

    it.failing('createDiv() should apply classes from the cls option', () => {
        const child = createDiv({
            cls: ['first-class', 'second-class'],
        });

        expectElementToHaveClasses(child, ['first-class', 'second-class']);
    });

    it.failing('createDiv() should apply a class from the cls option', () => {
        const child = createDiv({
            cls: 'single-class-value',
        });

        expectElementToHaveClasses(child, 'single-class-value');
    });

    it.failing('createDiv() should apply text from the text option', () => {
        const child = createDiv({
            text: 'example text content',
        });

        expect(child.textContent).toBe('example text content');
    });

    it.failing('createDiv() should apply DocumentFragment text content', () => {
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

    it.failing('createDiv() should apply both cls and text options', () => {
        const div = createDiv({
            cls: ['first-class', 'second-class'],
            text: 'example text content',
        });

        expectElementToHaveClasses(div, ['first-class', 'second-class']);
        expect(div.textContent).toBe('example text content');
    });

    it.failing('createDiv() should call the callback with the created div', () => {
        const callback = jest.fn();

        const div = createDiv(undefined, callback);

        expect(div.tagName).toBe('DIV');
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(div);
    });

    it.failing('createDiv() should apply text before calling the callback', () => {
        const callback = jest.fn();

        const div = createDiv({ text: 'example text content' }, callback);

        expect(div.textContent).toBe('example text content');
        expect(callback).toHaveBeenCalledWith(div);
        expect((callback.mock.calls[0][0] as HTMLDivElement).textContent).toBe('example text content');
    });
});

describe('HTMLElement.createDiv()', () => {
    it('createDiv() should create a div, append it to the parent, and return it', () => {
        const parent = createParentWithCreateDiv();

        const child = parent.createDiv();

        expectCorrectTagNameAndParentChildStructure(parent, child, 'DIV');
    });

    it('createDiv() should apply classes from the cls option', () => {
        const parent = createParentWithCreateDiv();

        const child = parent.createDiv({
            cls: ['first-class', 'second-class'],
        });

        expectElementToHaveClasses(child, ['first-class', 'second-class']);
    });

    it('createDiv() should apply a class from the cls option', () => {
        const parent = createParentWithCreateDiv();

        const child = parent.createDiv({
            cls: 'single-class-value',
        });

        expectElementToHaveClasses(child, 'single-class-value');
    });

    it('createDiv() should apply text from the text option', () => {
        const parent = createParentWithCreateDiv();

        const child = parent.createDiv({
            text: 'example text content',
        });

        expect(child.textContent).toBe('example text content');
    });

    it.failing('createDiv() should apply DocumentFragment text content', () => {
        const parent = createParentWithCreateDiv();

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
});

describe('HTMLElement.createSpan()', () => {
    it('createSpan() should create a span, append it to the parent, and return it', () => {
        const parent = createParentWithCreateSpan();

        const child = parent.createSpan();

        expectCorrectTagNameAndParentChildStructure(parent, child, 'SPAN');
    });
});
