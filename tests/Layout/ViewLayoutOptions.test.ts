import {
    type ParseViewLayoutOptionResult,
    ViewLayoutOptions,
    parseQueryViewMode,
} from '../../src/Layout/ViewLayoutOptions';

describe('storing view mode', () => {
    it('should default to list view', () => {
        const options = new ViewLayoutOptions();
        expect(options.viewMode).toEqual('list');
        expect(options.grouper).toBeNull();
    });

    it('should support columns view', () => {
        const options = new ViewLayoutOptions();
        options.viewMode = 'columns';
        expect(options.viewMode).toEqual('columns');
        expect(options.grouper).toBeNull();
    });
});

describe('parsing view mode', () => {
    it.each(['list', 'LIST'])('should parse "%s" mode', (mode) => {
        const options = new ViewLayoutOptions();
        options.viewMode = 'columns';

        const result = parseQueryViewMode(options, mode);
        expect(result.success).toEqual(true);
        expect(options.viewMode).toEqual('list');
        expect(options.grouper).toBeNull();
    });

    it.each(['columns', 'COLUMNS'])('should parse "%s" mode', (mode) => {
        const options = new ViewLayoutOptions();

        const result = parseQueryViewMode(options, mode);

        expect(result.success).toEqual(true);
        expect(options.viewMode).toEqual('columns');
    });

    it('should parse columns mode grouped by priority', () => {
        const options = new ViewLayoutOptions();

        const result = parseQueryViewMode(options, 'columns by priority');

        expect(result).toEqual({ success: true });
        expect(options.viewMode).toEqual('columns');
        expect(options.grouper).not.toBeNull();
        expect(options.grouper?.property).toEqual('priority');
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
