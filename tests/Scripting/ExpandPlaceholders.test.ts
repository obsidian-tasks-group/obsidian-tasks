import { expandPlaceholders } from '../../src/Scripting/ExpandPlaceholders';
import { makeQueryContext } from '../../src/lib/QueryContext';

/**
 * @summary
 * This file contains experiments with the Mustache templates library.
 * It will likely be deleted once the library is in use.
 */

// https://github.com/janl/mustache.js

describe('ExpandTemplate', () => {
    it('hard-coded call', () => {
        const view = {
            title: 'Joe',
            calc: () => 2 + 4,
        };

        const output = expandPlaceholders('{{ title }} spends {{ calc }}', view);
        expect(output).toMatchInlineSnapshot('"Joe spends 6"');
    });

    it('fake query - with file path', () => {
        const rawString = `path includes {{query.file.path}}
filename includes {{query.file.filename}}`;

        const path = 'a/b/path with space.md';
        const queryContext = makeQueryContext(path);
        expect(expandPlaceholders(rawString, queryContext)).toMatchInlineSnapshot(`
            "path includes a/b/path with space.md
            filename includes path with space.md"
        `);
    });

    it('should throw an error if unknown template field used', () => {
        const view = {
            title: 'Joe',
        };

        const source = '{{ title }} spends {{ unknownField }}';
        expect(() => expandPlaceholders(source, view)).toThrow('Missing Mustache data property: unknownField');
    });
});
