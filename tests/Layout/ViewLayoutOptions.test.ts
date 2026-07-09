import { ViewLayoutOptions } from '../../src/Layout/ViewLayoutOptions';

describe('storing view mode', () => {
    it('should default to list view', () => {
        const options = new ViewLayoutOptions();
        expect(options.viewMode).toEqual('list');
    });

    it('should support columns view', () => {
        const options = new ViewLayoutOptions();
        options.viewMode = 'columns';
        expect(options.viewMode).toEqual('columns');
    });
});
