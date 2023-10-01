import { PropertyCategory } from '../../src/lib/PropertyCategory';

describe('PropertyCategory', () => {
    it('should retain values passed to constructor', () => {
        const category = new PropertyCategory('text', 42);
        expect(category.name).toEqual('text');
        expect(category.sortOrder).toEqual(42);
    });

    it('should include sort order in group text', () => {
        const category = new PropertyCategory('text', 42);
        expect(category.groupText).toEqual('%%42%% text');
    });

    it('should give empty group text if name was empty', () => {
        const category = new PropertyCategory('', 42);
        expect(category.groupText).toEqual('');
    });
});
