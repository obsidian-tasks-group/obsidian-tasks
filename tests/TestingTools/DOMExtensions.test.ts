/**
 * @jest-environment jsdom
 */

type HTMLElementWithCreateEl = HTMLElement & {
    createEl<K extends keyof HTMLElementTagNameMap>(tag: K): HTMLElementTagNameMap[K];
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
});
