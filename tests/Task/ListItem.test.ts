import { ListItem } from '../../src/Task/ListItem';

describe('list item tests', () => {
    it('should create list item', () => {
        const listItem = new ListItem([]);
        expect(listItem).toBeDefined();
    });

    it('should create list item with a child', () => {
        const childItem = new ListItem([]);
        const listItem = new ListItem([childItem]);
        expect(listItem).toBeDefined();
        expect(listItem.children).toEqual([childItem]);
    });
});
