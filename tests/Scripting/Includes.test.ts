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

const tasksFile = new TasksFile('root/folder/stuff.md');

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

function expectFiltersToBe(query: Query, expectedFilterLines: string[]) {
    expect(query.filters.map((filter) => filter.statement.anyPlaceholdersExpanded)).toEqual(expectedFilterLines);
}

describe('include tests', () => {
    describe('whole-line placeholder', () => {
        const includes = makeIncludes(['not_done', 'not done']);

        it('should accept whole-line include placeholder', () => {
            const source = '{{includes.not_done}}';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, ['not done']);
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "{{includes.not_done}} =>
                not done
                "
            `);
        });

        it('should accept whole-line include filter instruction', () => {
            const source = 'include not_done';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, ['not done']);
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "include not_done =>
                not done
                "
            `);
        });

        it('should accept whole-line include filter instruction, continued over two lines', () => {
            const source = 'include \\\nnot_done';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, ['not done']);
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "include \\
                not_done
                 =>
                include not_done =>
                not done
                "
            `);
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

        expectFiltersToBe(query, ['scheduled tomorrow']);

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

        expectFiltersToBe(query, ['not done']);

        expect(query.queryLayoutOptions.hideEditButton).toEqual(true);
        expectExpandedStatementToBe(query.layoutStatements[0], 'hide edit button');
    });

    describe('placeholders inside includes', () => {
        const includes = makeIncludes(['this_path', 'path includes {{query.file.path}}']);

        it('includes placeholder should expand placeholder in include value', () => {
            const source = '{{includes.this_path}}';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, ['path includes root/folder/stuff.md']);
        });

        it('include instruction should expand placeholder in include value', () => {
            const source = 'include this_path';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, ['path includes root/folder/stuff.md']);
        });
    });

    describe('multi-line placeholders inside includes', () => {
        const includes = makeIncludes(
            ['two_lines', 'has due date\nhas created date'],
            ['two_lines_as_include', 'include two_lines'],
            ['two_lines_as_placeholder', '{{includes.two_lines}}'],
        );

        it('includes placeholder should detect both lines in included value', () => {
            const source = '{{includes.two_lines_as_placeholder}}';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, ['has due date', 'has created date']);
        });

        it('includes placeholders should be ignored in comments', () => {
            const source = '# {{includes.two_lines_as_placeholder}}';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, []);
        });

        it('include another include instruction should detect both lines in included value', () => {
            const source = 'include two_lines_as_include';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, ['has due date', 'has created date']);
        });

        it('include a placeholder include should detect both lines in included value BUT DOES NOT', () => {
            // TODO Handle expanding multi-line placeholders
            const source = 'include two_lines_as_placeholder';
            const query = createQuery(source, includes);
            expect(query.error).toMatchInlineSnapshot(`
                "do not understand query
                Problem statement:
                    include two_lines_as_placeholder =>
                    has due date
                has created date
                "
            `);
        });
    });

    describe('placeholders inside placeholders', () => {
        const includes = makeIncludes(
            // 3 includes that each contain 1 query.file placeholder:
            ['this_path', 'path includes {{query.file.path}}'],
            ['this_folder', 'folder includes {{query.file.folder}}'],
            ['this_root', 'root includes {{query.file.root}}'],
            // 2-level include:
            ['this_everything', '{{includes.this_path}}\n{{includes.this_folder}}\n{{includes.this_root}}'],
            // 3-level include:
            ['this_everything_indirect', '{{includes.this_everything}}'],
        );

        const expectedFilterLines = [
            'path includes root/folder/stuff.md',
            'folder includes root/folder/',
            'root includes root/',
        ];

        it('includes placeholder should support placeholders inside simple instructions', () => {
            const source = '{{includes.this_path}}\n{{includes.this_folder}}\n{{includes.this_root}}';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, expectedFilterLines);
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "{{includes.this_path}} =>
                path includes root/folder/stuff.md

                {{includes.this_folder}} =>
                folder includes root/folder/

                {{includes.this_root}} =>
                root includes root/
                "
            `);
        });

        it('includes placeholder should support one-level nested placeholders', () => {
            const source = '{{includes.this_everything}}';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, expectedFilterLines);
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "{{includes.this_everything}}: statement 1 after expansion of placeholder =>
                path includes root/folder/stuff.md

                {{includes.this_everything}}: statement 2 after expansion of placeholder =>
                folder includes root/folder/

                {{includes.this_everything}}: statement 3 after expansion of placeholder =>
                root includes root/
                "
            `);
        });

        it('includes placeholder should support two-level nested placeholders', () => {
            const source = '{{includes.this_everything_indirect}}';
            const query = createValidQuery(source, includes);
            expectFiltersToBe(query, expectedFilterLines);
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "{{includes.this_everything_indirect}}: statement 1 after expansion of placeholder =>
                path includes root/folder/stuff.md

                {{includes.this_everything_indirect}}: statement 2 after expansion of placeholder =>
                folder includes root/folder/

                {{includes.this_everything_indirect}}: statement 3 after expansion of placeholder =>
                root includes root/
                "
            `);
        });
    });

    describe('continuation lines inside includes', () => {
        const continuationLine = String.raw`group by function \
return "Hello World";`;
        const includes = makeIncludes(['instruction_with_continuation_lines', continuationLine]);

        const expectedStatement = 'group by function return "Hello World";';

        it('includes placeholder supports line continuations in include value', () => {
            const source = '{{includes.instruction_with_continuation_lines}}';
            const query = createValidQuery(source, includes);
            expectExpandedStatementToBe(query.grouping[0].statement, expectedStatement);
        });

        it('include instruction supports line continuations in include value', () => {
            const source = 'include instruction_with_continuation_lines';
            const query = createValidQuery(source, includes);
            expectExpandedStatementToBe(query.grouping[0].statement, expectedStatement);
        });
    });

    describe('includes inside Boolean combinations', () => {
        // ( {{includes.filter1}} ) AND ( {{includes.filter2}} )
        // ( include filter1 ) AND ( include filter2 )
        const includes = makeIncludes(
            // Force line break
            ['filter1', 'not done'],
            ['filter2', 'due 2025-05-01'],
        );
        const expectedStatement = '( not done ) AND ( due 2025-05-01 )';

        it('should allow Boolean instructions to use includes placeholders', () => {
            const source = '( {{includes.filter1}} ) AND ( {{includes.filter2}} )';
            const query = createValidQuery(source, includes);

            expectFiltersToBe(query, [expectedStatement]);
            expect(query.explainQuery()).toMatchInlineSnapshot(`
                "( {{includes.filter1}} ) AND ( {{includes.filter2}} ) =>
                ( not done ) AND ( due 2025-05-01 ) =>
                  AND (All of):
                    not done
                    due 2025-05-01 =>
                      due date is on 2025-05-01 (Thursday 1st May 2025)
                "
            `);
        });

        it('should allow Boolean instructions to use include instruction BUT DOES NOT', () => {
            const source = '( include filter1 ) AND ( include filter2 )';
            const query = createQuery(source, includes);
            expect(query.error).toMatchInlineSnapshot(`
                "Could not interpret the following instruction as a Boolean combination:
                    ( include filter1 ) AND ( include filter2 )

                The error message is:
                    couldn't parse sub-expression 'include filter1'

                The instruction was converted to the following simplified line:
                    ( f1 ) AND ( f2 )

                Where the sub-expressions in the simplified line are:
                    'f1': 'include filter1'
                        => ERROR:
                           do not understand query
                    'f2': 'include filter2'
                        => ERROR:
                           do not understand query

                For help, see:
                    https://publish.obsidian.md/tasks/Queries/Combining+Filters

                Problem line: "( include filter1 ) AND ( include filter2 )""
            `);
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

    describe('infinite recursion of instruction', () => {
        const includes = makeIncludes(
            ['self_reference_1', '{{includes.self_reference_1}}'],
            ['self_reference_2', 'include self_reference_2'],
        );

        it('includes placeholder should give meaningful error message about self-referencing instructions BUT DOES NOT', () => {
            // TODO Better error error message for '{{includes.self_reference}}'
            const query = createQuery('{{includes.self_reference_1}}', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "Could not interpret the following instruction as a Boolean combination:
                    {{includes.self_reference_1}}

                The error message is:
                    couldn't parse sub-expression 'includes.self_reference_1'

                The instruction was converted to the following simplified line:
                    ((f1))

                Where the sub-expressions in the simplified line are:
                    'f1': 'includes.self_reference_1'
                        => ERROR:
                           do not understand query

                For help, see:
                    https://publish.obsidian.md/tasks/Queries/Combining+Filters

                Problem line: "{{includes.self_reference_1}}""
            `);
        });

        it('include instruction should give meaningful error message about self-referencing instructions BUT DOES NOT', () => {
            // TODO Better error error message for 'include self_reference'
            const query = createQuery('include self_reference_2', includes);
            expect(query.error).toMatchInlineSnapshot(`
                "Maximum call stack size exceeded
                Problem line: "include self_reference_2""
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
