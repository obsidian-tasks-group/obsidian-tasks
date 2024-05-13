import { ListItem } from '../../src/Task/ListItem';

describe('list item tests', () => {
    it('should create list item', () => {
        const listItem = new ListItem();
        expect(listItem).toBeDefined();
    });
});
