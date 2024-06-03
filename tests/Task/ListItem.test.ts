import { expect } from '@jest/globals';
import { ListItem } from '../../src/Task/ListItem';

describe('list item tests', () => {
    it('should create list item with empty children and absent parent', () => {
        const listItem = new ListItem('', null);
        expect(listItem).toBeDefined();
        expect(listItem.children).toEqual([]);
        expect(listItem.parent).toEqual(null);
    });

    it('should create list item with a child', () => {
        const listItem = new ListItem('', null);
        const childItem1 = new ListItem('', listItem);
        const childItem2 = new ListItem('', listItem);
        expect(listItem).toBeDefined();
        expect(childItem1.parent).toEqual(listItem);
        expect(childItem2.parent).toEqual(listItem);
        expect(listItem.children).toEqual([childItem1, childItem2]);
    });

    it('should create list item with a parent', () => {
        const parentItem = new ListItem('', null);
        const listItem = new ListItem('', parentItem);
        expect(listItem).toBeDefined();
        expect(listItem.parent).toEqual(parentItem);
        expect(parentItem.children).toEqual([listItem]);
    });
});
