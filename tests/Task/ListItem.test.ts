import { ListItem } from '../../src/Task/ListItem';

describe('list item tests', () => {
    it('should create list item with empty children and absent parent', () => {
        const listItem = new ListItem(null, []);
        expect(listItem).toBeDefined();
        expect(listItem.children).toEqual([]);
        expect(listItem.parent).toEqual(null);
    });

    it('should create list item with a child', () => {
        const childItem1 = new ListItem(null, []);
        const childItem2 = new ListItem(null, []);
        const listItem = new ListItem(null, [childItem1, childItem2]);
        expect(listItem).toBeDefined();
        expect(listItem.children).toEqual([childItem1, childItem2]);
    });

    it('should create list item with a parent', () => {
        const parentItem = new ListItem(null, []);
        const listItem = new ListItem(parentItem, []);
        expect(listItem).toBeDefined();
        expect(listItem.parent).toEqual(parentItem);
    });
});
