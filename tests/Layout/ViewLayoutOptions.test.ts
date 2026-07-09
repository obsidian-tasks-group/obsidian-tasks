import {
    type ParseViewLayoutOptionResult,
    ViewLayoutOptions,
    parseQueryViewMode,
} from '../../src/Layout/ViewLayoutOptions';

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
        expect(result.success).toEqual(true);
        expect(options.viewMode).toEqual('list');
    });

    it('should parse columns mode', () => {
        const options = new ViewLayoutOptions();

        const result = parseQueryViewMode(options, 'columns');

        expect(result.success).toEqual(true);
        expect(options.viewMode).toEqual('columns');
    });

    it('should report available options for unknown mode', () => {
        const options = new ViewLayoutOptions();
        const initialMode = 'columns';
        options.viewMode = initialMode;

        const result: ParseViewLayoutOptionResult = parseQueryViewMode(options, 'invalid');

        // Make sure the mode is not changed when there is an error:
        expect(options.viewMode).toEqual(initialMode);

        expect(result.success).toEqual(false);

        if (!result.success) {
            // Ensure that the error message contains the supplied option:
            expect(result.error).toContain('invalid');

            // Inspect the full error message:
            expect(result.error).toMatchInlineSnapshot(`
                "do not understand view mode "invalid"

                The available view modes are:
                    list
                    columns

                For example:
                    view list"
            `);
        }
    });
});
