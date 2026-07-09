import { ViewLayoutOptions, parseQueryViewMode } from '../../src/Layout/ViewLayoutOptions';

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

describe('parsing view mode', () => {
    it('should parse list mode', () => {
        const options = new ViewLayoutOptions();
        options.viewMode = 'columns';

        const result = parseQueryViewMode(options, 'list');
        expect(result).toEqual(true);
        expect(options.viewMode).toEqual('list');
    });

    it('should parse columns mode grouped by priority', () => {
        const options = new ViewLayoutOptions();

        const result = parseQueryViewMode(options, 'columns');

        expect(result).toEqual(true);
        expect(options.viewMode).toEqual('columns');
    });

    it('should report if unknown view mode supplied', () => {
        const options = new ViewLayoutOptions();
        const initialMode = 'columns';
        options.viewMode = initialMode;

        const result = parseQueryViewMode(options, 'invalid');

        // Make sure the mode is not changed when there is an error:
        expect(options.viewMode).toEqual(initialMode);

        expect(result).toEqual(false);
    });
});
