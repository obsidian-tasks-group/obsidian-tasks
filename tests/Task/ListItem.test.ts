import { ListItem } from '../../src/Task/ListItem';

describe('list item tests', () => {
    it('should create list item with empty children and absent parent', () => {
        const listItem = new ListItem([]);
        expect(listItem).toBeDefined();
        expect(listItem.children).toEqual([]);
        expect(listItem.parent).toEqual(null);
    });

    it('should create list item with a child', () => {
        const childItem1 = new ListItem([]);
        const childItem2 = new ListItem([]);
        const listItem = new ListItem([childItem1, childItem2]);
        expect(listItem).toBeDefined();
        expect(listItem.children).toEqual([childItem1, childItem2]);
    });
});
