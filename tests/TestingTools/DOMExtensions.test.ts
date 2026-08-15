/**
 * @jest-environment jsdom
 */

describe('Obsidian DOM extensions in tests', () => {
    it.failing('createEl() should create an element, append it to the parent, and return it', () => {
        const parent = document.createElement('div');

        // Fails with parent.createEl is not a function
        const child = parent.createEl('input');

        expect(child.tagName).toBe('INPUT');
        expect(parent.children).toHaveLength(1);
        expect(parent.firstElementChild).toBe(child);
    });
});
