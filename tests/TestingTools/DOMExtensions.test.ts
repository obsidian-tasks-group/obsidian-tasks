/**
 * @jest-environment jsdom
 */

type HTMLElementWithCreateEl = HTMLElement & {
    createEl<K extends keyof HTMLElementTagNameMap>(
        tag: K,
        o?: { type?: string; cls?: string[] },
    ): HTMLElementTagNameMap[K];
};

type HTMLElementWithCreateDiv = HTMLElement & {
    createDiv(): HTMLDivElement;
};

describe('Obsidian DOM extensions in tests', () => {
    it('createEl() should create an element, append it to the parent, and return it', () => {
        const parent = document.createElement('div') as HTMLElementWithCreateEl;

        // This documents the baseline behavior we rely on from Obsidian's createEl().
        const child = parent.createEl('input');

        expect(child.tagName).toBe('INPUT');
        expect(parent.children).toHaveLength(1);
        expect(parent.firstElementChild).toBe(child);
    });

    it('createEl() should apply the type option to an input element', () => {
        const parent = document.createElement('div') as HTMLElementWithCreateEl;

        const child = parent.createEl('input', { type: 'checkbox' });

        expect(child.tagName).toBe('INPUT');
        expect(child.type).toBe('checkbox');
    });

    it('createEl() should apply classes from the cls option', () => {
        const parent = document.createElement('div') as HTMLElementWithCreateEl;

        const child = parent.createEl('input', {
            cls: ['task-list-item-checkbox', 'tasks-quick-search-result-checkbox'],
        });

        expect(child.classList).toContain('task-list-item-checkbox');
        expect(child.classList).toContain('tasks-quick-search-result-checkbox');
    });

    it('createDiv() should create a div, append it to the parent, and return it', () => {
        const parent = document.createElement('section') as HTMLElementWithCreateDiv;

        const child = parent.createDiv();

        expect(child.tagName).toBe('DIV');
        expect(parent.children).toHaveLength(1);
        expect(parent.firstElementChild).toBe(child);
    });
});
