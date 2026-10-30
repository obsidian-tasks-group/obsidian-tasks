import { resolveKnownPlaceholder } from '../../src/Scripting/KnownPlaceholderResolver';
import { makeQueryContext } from '../../src/Scripting/QueryContext';
import { getTasksFileFromMockData } from '../TestingTools/MockDataHelpers';
import { ActiveFile } from '../../src/Scripting/ActiveFile';
import { createTestTasksFile } from '../TestingTools/TasksFileHelpers';

describe('KnownPlaceholderResolver', () => {
    const tasksFile = getTasksFileFromMockData('yaml_all_property_types_populated');
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
            expectResolvedPlaceholderToBe('query.file.path', 'Test Data/yaml_all_property_types_populated.md');
        });

        it('resolves query.file.pathWithoutExtension', () => {
            expectResolvedPlaceholderToBe(
                'query.file.pathWithoutExtension',
                'Test Data/yaml_all_property_types_populated',
            );
        });

        it('resolves query.file.root', () => {
            expectResolvedPlaceholderToBe('query.file.root', 'Test Data/');
        });

        it('resolves query.file.folder', () => {
            expectResolvedPlaceholderToBe('query.file.folder', 'Test Data/');
        });

        it('resolves query.file.filename', () => {
            expectResolvedPlaceholderToBe('query.file.filename', 'yaml_all_property_types_populated.md');
        });

        it('resolves query.file.filenameWithoutExtension', () => {
            expectResolvedPlaceholderToBe('query.file.filenameWithoutExtension', 'yaml_all_property_types_populated');
        });

        it('resolves query.file.outlinksInProperties', () => {
            expectResolvedPlaceholderToBe(
                'query.file.outlinksInProperties',
                queryContext.query.file.outlinksInProperties,
            );
        });

        it('resolves query.file.outlinksInBody', () => {
            expectResolvedPlaceholderToBe('query.file.outlinksInBody', queryContext.query.file.outlinksInBody);
        });

        it('resolves query.file.outlinks', () => {
            expectResolvedPlaceholderToBe('query.file.outlinks', queryContext.query.file.outlinks);
        });
    });

    describe('query.file property methods', () => {
        it('resolves query.file.hasProperty() with single quotes', () => {
            expectResolvedPlaceholderToBe("query.file.hasProperty('non_existent_property')", false);
        });

        it('resolves query.file.hasProperty() with double quotes', () => {
            expectResolvedPlaceholderToBe('query.file.hasProperty("sample_link_property")', true);
        });

        it('resolves query.file.property() with single quotes', () => {
            expectResolvedPlaceholderToBe("query.file.property('non_existent_property')", null);
        });

        it('resolves query.file.property() with double quotes', () => {
            expectResolvedPlaceholderToBe('query.file.property("sample_number_property")', 246);
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

    describe('query.activeFile', () => {
        afterEach(() => {
            ActiveFile.getInstance().resetGetActiveFileFn();
        });

        it('resolves query.activeFile fields from the active file, not the query file', () => {
            ActiveFile.getInstance().setGetActiveFileFn(() => createTestTasksFile('notes/open note.md'));
            const context = makeQueryContext(tasksFile);

            expect(resolveKnownPlaceholder('query.activeFile.path', context)).toEqual({
                resolved: true,
                value: 'notes/open note.md',
            });
            expect(resolveKnownPlaceholder('query.activeFile.filenameWithoutExtension', context)).toEqual({
                resolved: true,
                value: 'open note',
            });
            expect(resolveKnownPlaceholder("query.activeFile.hasProperty('x')", context)).toEqual({
                resolved: true,
                value: false,
            });
        });

        it('throws a clear error when there is no active file', () => {
            expect(() => resolveKnownPlaceholder('query.activeFile.path', queryContext)).toThrow(
                'There is no active file, so cannot expand {{query.activeFile.path}}',
            );
        });

        it('does not resolve unknown query.activeFile properties', () => {
            expectPlaceholderNotToBeResolved('query.activeFile.noSuchProperty');
        });
    });

    describe('formatting', () => {
        it('ignores whitespace around placeholder expression', () => {
            expectResolvedPlaceholderToBe(' query.file.path ', 'Test Data/yaml_all_property_types_populated.md');
        });
    });
});
