import { expandPlaceholders } from '../../src/Scripting/ExpandPlaceholders';
import { makeQueryContext } from '../../src/Scripting/QueryContext';

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

    it('should throw an error if unknown template nested field used', () => {
        const queryContext = makeQueryContext('stuff.md');
        const source = '{{ query.file.nonsense }}';

        expect(() => expandPlaceholders(source, queryContext)).toThrow(
            'Missing Mustache data property: query > file > nonsense',
        );
    });
});
