import { resolveKnownPlaceholder } from '../../src/Scripting/KnownPlaceholderResolver';
import { makeQueryContext } from '../../src/Scripting/QueryContext';
import { TasksFile } from '../../src/Scripting/TasksFile';

describe('KnownPlaceholderResolver', () => {
    const tasksFile = new TasksFile('root/sub-folder/file containing query.md');
    const queryContext = makeQueryContext(tasksFile);

    function expectResolvedPlaceholderToBe(placeholder: string, expectedValue: unknown) {
        const resolution = resolveKnownPlaceholder(placeholder, queryContext);

        expect(resolution.resolved).toEqual(true);
        if (resolution.resolved) {
            expect(resolution.value).toEqual(expectedValue);
        }
    }

    function expectPlaceholderNotToBeResolved(placeholder: string) {
        expect(resolveKnownPlaceholder(placeholder, queryContext)).toEqual({
            resolved: false,
        });
    }

    describe('query.file properties', () => {
        it('resolves query.file.path', () => {
            expectResolvedPlaceholderToBe('query.file.path', 'root/sub-folder/file containing query.md');
        });

        it('resolves query.file.pathWithoutExtension', () => {
            expectResolvedPlaceholderToBe('query.file.pathWithoutExtension', 'root/sub-folder/file containing query');
        });

        it('resolves query.file.root', () => {
            expectResolvedPlaceholderToBe('query.file.root', 'root/');
        });

        it('resolves query.file.folder', () => {
            expectResolvedPlaceholderToBe('query.file.folder', 'root/sub-folder/');
        });

        it('resolves query.file.filename', () => {
            expectResolvedPlaceholderToBe('query.file.filename', 'file containing query.md');
        });

        it('resolves query.file.filenameWithoutExtension', () => {
            expectResolvedPlaceholderToBe('query.file.filenameWithoutExtension', 'file containing query');
        });

        it('resolves query.file.outlinksInProperties', () => {
            expectResolvedPlaceholderToBe('query.file.outlinksInProperties', []);
        });

        it('resolves query.file.outlinksInBody', () => {
            expectResolvedPlaceholderToBe('query.file.outlinksInBody', []);
        });

        it('resolves query.file.outlinks', () => {
            expectResolvedPlaceholderToBe('query.file.outlinks', []);
        });
    });

    describe('query.file property methods', () => {
        it('resolves query.file.hasProperty() with single quotes', () => {
            expectResolvedPlaceholderToBe("query.file.hasProperty('non_existent_property')", false);
        });

        it('resolves query.file.hasProperty() with double quotes', () => {
            expectResolvedPlaceholderToBe('query.file.hasProperty("non_existent_property")', false);
        });

        it('resolves query.file.property() with single quotes', () => {
            expectResolvedPlaceholderToBe("query.file.property('non_existent_property')", null);
        });

        it('resolves query.file.property() with double quotes', () => {
            expectResolvedPlaceholderToBe('query.file.property("non_existent_property")', null);
        });
    });

    describe('unsupported expressions', () => {
        it('does not resolve arbitrary expressions', () => {
            expectPlaceholderNotToBeResolved('4 + 6');
        });

        it('does not resolve non-approved method calls', () => {
            expectPlaceholderNotToBeResolved('query.file.path.toUpperCase()');
        });

        it('does not resolve query.file.property() with an expression argument', () => {
            expectPlaceholderNotToBeResolved("query.file.property('task_' + 'instruction')");
        });

        it('does not resolve unknown query.file properties', () => {
            expectPlaceholderNotToBeResolved('query.file.noSuchProperty');
        });

        it('does not resolve non-query placeholders', () => {
            expectPlaceholderNotToBeResolved('preset.this_file');
        });
    });

    describe('formatting', () => {
        it('ignores whitespace around placeholder expression', () => {
            expectResolvedPlaceholderToBe(' query.file.path ', 'root/sub-folder/file containing query.md');
        });
    });
});
