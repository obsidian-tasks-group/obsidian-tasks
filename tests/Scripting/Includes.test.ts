/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { type IncludesMap, getSettings, resetSettings, updateSettings } from '../../src/Config/Settings';
import { Query } from '../../src/Query/Query';
import { TasksFile } from '../../src/Scripting/TasksFile';
import type { Statement } from '../../src/Query/Statement';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-04-28'));
});

afterEach(() => {
    resetSettings();
});

export function makeIncludes(...entries: [string, string][]): IncludesMap {
    return Object.fromEntries(entries);
}

const tasksFile = new TasksFile('stuff.md');

function createQuery(source: string, includes: IncludesMap) {
    updateSettings({ includes });
    const query = new Query(source, tasksFile);

    expect(query.source).toEqual(source);

    return query;
}

function createValidQuery(source: string, includes: IncludesMap) {
    const query = createQuery(source, includes);

    expect(query.error).toBeUndefined();

    return query;
}

function expectExpandedStatementToBe(statement: Statement, expandedLine: string) {
    expect(statement.anyPlaceholdersExpanded).toEqual(expandedLine);
}

describe('include tests', () => {
    describe('whole-line placeholder', () => {
        const includes = makeIncludes(['not_done', 'not done']);

        it('should accept whole-line include placeholder', () => {
            const source = '{{includes.not_done}}';
            const query = createValidQuery(source, includes);
            expect(query.filters.length).toEqual(1);
            expectExpandedStatementToBe(query.filters[0].statement, 'not done');
        });

        it('should accept whole-line include filter instruction', () => {
            const source = 'include not_done';
            const query = createValidQuery(source, includes);
            expect(query.filters.length).toEqual(1);
            expectExpandedStatementToBe(query.filters[0].statement, 'not done');
        });
    });

    it('should accept whole-line include layout instruction', () => {
        const includes = makeIncludes(['show_tree', 'show tree']);
        const source = 'include show_tree';

        const query = createValidQuery(source, includes);

        expect(query.queryLayoutOptions.hideTree).toEqual(false);
        expectExpandedStatementToBe(query.layoutStatements[0], 'show tree');
    });

    it('should accept multi-line include', () => {
        const includes = makeIncludes(['multi_line', 'scheduled tomorrow\nhide backlink']);
        const source = 'include multi_line';

        const query = createValidQuery(source, includes);

        expect(query.filters.length).toEqual(1);
        expectExpandedStatementToBe(query.filters[0].statement, 'scheduled tomorrow');

        expect(query.queryLayoutOptions.hideBacklinks).toEqual(true);
        expectExpandedStatementToBe(query.layoutStatements[0], 'hide backlink');
    });

    it('should support nested include instructions', () => {
        const includes = makeIncludes(
            // Force line break
            ['inside', 'not done'],
            ['out', 'include inside\nhide edit button'],
        );
        const source = 'include out';

        const query = createValidQuery(source, includes);

        expect(query.filters.length).toEqual(1);
        expectExpandedStatementToBe(query.filters[0].statement, 'not done');

        expect(query.queryLayoutOptions.hideEditButton).toEqual(true);
        expectExpandedStatementToBe(query.layoutStatements[0], 'hide edit button');
    });

    describe('placeholders inside includes', () => {
        const includes = makeIncludes(['this_path', 'path includes {{query.file.path}}']);

        it('includes placeholder should expand placeholder in include value', () => {
            const source = '{{includes.this_path}}';
            const query = createValidQuery(source, includes);
            expectExpandedStatementToBe(query.filters[0].statement, 'path includes stuff.md');
        });

        it('include instruction DOES NOT YET expand placeholder in include value', () => {
            const source = 'include this_path';
            const query = createQuery(source, includes);
            // This would currently generate an instruction containing an unexpanded placeholder:
            //      'path includes {{query.file.path}}'
            // which is not what users would intend, and which silently matches no tasks.
            // So for now, Query's handing of the include instruction refuses to act on any
            // Includes that contain placeholder text.
            expect(query.error).toMatchInlineSnapshot(`
                "Cannot yet include instructions containing placeholders.
                You can use a placeholder line instead, like this:
                  {{includes.this_path}}
                Problem line: "include this_path""
            `);
        });
    });

    describe('continuation lines inside includes', () => {
        const continuationLine = String.raw`group by function \
return "Hello World";`;
        const includes = makeIncludes(['instruction_with_continuation_lines', continuationLine]);

        const expectedStatement = 'group by function return "Hello World";';

        it('includes placeholder DOES NOT YET SUPPORT line continuations in include value', () => {
            // Just as TQ_extra_instructions (in Query File Defaults) does not work with line continuations,
            // so includes in placeholders do not.
            // This is because line continuations are applied only once, before the placeholders
            // are expanded.

            const source = '{{includes.instruction_with_continuation_lines}}';
            const query = createQuery(source, includes);
            expect(query.error).toMatchInlineSnapshot(`
                "Could not interpret the following instruction as a Boolean combination:
                    return "Hello World";

                The error message is:
                    All filters in a Boolean instruction must be inside one of these pairs of delimiter characters: (...) or [...] or {...} or "...". Combinations of those delimiters are no longer supported.
                Problem statement:
                    {{includes.instruction_with_continuation_lines}}: statement 2 after expansion of placeholder =>
                    return "Hello World";
                "
            `);
        });

        it('include instruction supports line continuations in include value', () => {
            const source = 'include instruction_with_continuation_lines';
            const query = createValidQuery(source, includes);
            expectExpandedStatementToBe(query.grouping[0].statement, expectedStatement);
        });
    });
});

describe('include - explain output', () => {
    describe('explain two levels of nested includes', () => {
        const includes = makeIncludes(
            ['inside', '(happens this week) AND (starts before today)'],
            ['out', 'include inside\nnot done'],
        );

        it('includes placeholder should explain two levels of nested includes', () => {
            const query = createValidQuery('{{includes.out}}', includes);
            // The 'statement 1', 'statement 2' text is useful in clarifying that
            // some text was expanded in to more than one line.
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "{{includes.out}}: statement 1 after expansion of placeholder =>
                (happens this week) AND (starts before today) =>
                  AND (All of):
                    happens this week =>
                      due, start or scheduled date is between:
                        2025-04-28 (Monday 28th April 2025) and
                        2025-05-04 (Sunday 4th May 2025) inclusive
                    starts before today =>
                      start date is before 2025-04-28 (Monday 28th April 2025) OR no start date

                {{includes.out}}: statement 2 after expansion of placeholder =>
                not done
                "
            `);
        });

        it('include instruction should explain two levels of nested includes', () => {
            const query = createValidQuery('include out', includes);
            // With the repeated output 'include out =>', it is less obvious than in
            // the previous test that some text was expanded in to more than one line.
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "include out =>
                (happens this week) AND (starts before today) =>
                  AND (All of):
                    happens this week =>
                      due, start or scheduled date is between:
                        2025-04-28 (Monday 28th April 2025) and
                        2025-05-04 (Sunday 4th May 2025) inclusive
                    starts before today =>
                      start date is before 2025-04-28 (Monday 28th April 2025) OR no start date

                include out =>
                not done
                "
            `);
        });
    });
});

describe('include - error messages', () => {
    describe('use of non-existent include, when no includes are defined', () => {
        const includes = {};

        it('includes placeholder should give a meaningful error for non-existent include', () => {
            const query = createQuery('{{includes.not_existent}}', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "There was an error expanding one or more placeholders.

                The error message was:
                    Unknown property: includes.not_existent

                The problem is in:
                    {{includes.not_existent}}"
            `);
        });

        it('include instruction should give a meaningful error for non-existent include', () => {
            const query = createQuery('include not_existent', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "Cannot find include "not_existent" in the Tasks settings
                You can define the instruction(s) for "not_existent" in the Tasks settings.
                Problem line: "include not_existent""
            `);
        });
    });

    describe('use of non-existent include, when some includes are defined', () => {
        const includes = makeIncludes(
            ['include2', 'task.due.format("YYYY")'],
            ['include1', 'sort by function task.lineNumber'],
            [
                'include3',
                '(filename includes File 1) AND ( (heading includes Heading 1) OR (description includes Something else) )',
            ],
            [
                'include4_longer_name',
                `(filename includes File 1) AND \\
    ( (heading includes Heading 1) OR \\
    (description includes Something else) )`,
            ],
        );

        it('includes placeholder should give a meaningful error for non-existent include', () => {
            const query = createQuery('{{includes.not_existent}}', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "There was an error expanding one or more placeholders.

                The error message was:
                    Unknown property: includes.not_existent

                The problem is in:
                    {{includes.not_existent}}"
            `);
        });

        it('include instruction should give a meaningful error for non-existent include', () => {
            const query = createQuery('include not_existent', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "Cannot find include "not_existent" in the Tasks settings
                The following includes are defined in the Tasks settings:
                  include1            : sort by function task.lineNumber
                  include2            : task.due.format("YYYY")
                  include3            : (filename includes File 1) AND ( (heading includes...
                  include4_longer_name: (filename includes File 1) AND \\...
                Problem line: "include not_existent""
            `);
        });
    });

    describe('expanded text is invalid instruction', () => {
        const includes = makeIncludes(
            // Force line break
            ['inside', 'apple sauce'],
            ['out', 'include inside'],
        );

        it('includes placeholder should give meaningful error message about included text', () => {
            const query = createQuery('{{includes.out}}', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "do not understand query
                Problem statement:
                    {{includes.out}} =>
                    apple sauce
                "
            `);
        });

        it('include instruction should give meaningful error message about included text', () => {
            const query = createQuery('include out', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "do not understand query
                Problem statement:
                    include out =>
                    apple sauce
                "
            `);
        });
    });
});

describe('include settings tests', () => {
    it('should have an empty include field', () => {
        const settings = getSettings();

        expect(settings.includes).toEqual({});
    });
});
