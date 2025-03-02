/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { GlobalFilter } from '../../../src/Config/GlobalFilter';
import { Query } from '../../../src/Query/Query';
import { Explainer } from '../../../src/Query/Explain/Explainer';
import { resetSettings, updateSettings } from '../../../src/Config/Settings';
import { DebugSettings } from '../../../src/Config/DebugSettings';
import { TasksFile } from '../../../src/Scripting/TasksFile';

window.moment = moment;

/**
 * Join all the lines with continuation character, then create query
 * @param lines
 */
function makeQueryFromContinuationLines(lines: string[]) {
    const source = lines.join('\\\n');
    const query = new Query(source, new TasksFile('sample.md'));
    expect(query.error).toBeUndefined();
    return query;
}

afterEach(() => {
    GlobalFilter.getInstance().reset();
    resetSettings();
});

const explainer = new Explainer();

describe('explain errors', () => {
    it('should include any error message in the explanation', () => {
        const source = 'i am a nonsense query';
        const query = new Query(source);
        expect(explainer.explainQuery(query)).toMatchInlineSnapshot(`
                "Query has an error:
                do not understand query
                Problem line: "i am a nonsense query"
                "
            `);
    });
});

describe('explain everything', () => {
    const sampleOfAllInstructionTypes = `
filter by function \\
     task.path === '{{query.file.path}}'
not done
(has start date) AND (description includes some)

group by function \\
    task.path.includes('{{query.file.path}}')
group by priority reverse
group by happens

sort by function \\
    task.path.includes('{{query.file.path}}')
sort by description reverse
sort by path

show urgency
short mode
limit 50
limit groups 3

ignore global query
`;

    it('all types of instruction - not indented', () => {
        // Disable sort instructions
        updateSettings({ debugSettings: new DebugSettings(true) });

        const query = new Query(sampleOfAllInstructionTypes, new TasksFile('sample.md'));
        expect(explainer.explainQuery(query)).toMatchInlineSnapshot(`
            "ignore global query

            filter by function \\
                 task.path === '{{query.file.path}}'
             =>
            filter by function task.path === '{{query.file.path}}' =>
            filter by function task.path === 'sample.md'

            not done

            (has start date) AND (description includes some) =>
              AND (All of):
                has start date
                description includes some

            group by function \\
                task.path.includes('{{query.file.path}}')
             =>
            group by function task.path.includes('{{query.file.path}}') =>
            group by function task.path.includes('sample.md')

            group by priority reverse

            group by happens

            sort by function \\
                task.path.includes('{{query.file.path}}')
             =>
            sort by function task.path.includes('{{query.file.path}}') =>
            sort by function task.path.includes('sample.md')

            sort by description reverse

            sort by path

            show urgency

            short mode

            At most 50 tasks.

            At most 3 tasks per group (if any "group by" options are supplied).

            NOTE: All sort instructions, including default sort order, are disabled, due to 'ignoreSortInstructions' setting.
            "
        `);
    });

    it('all types of instruction - indented', () => {
        // Disable sort instructions
        updateSettings({ debugSettings: new DebugSettings(true) });

        const query = new Query(sampleOfAllInstructionTypes, new TasksFile('sample.md'));
        const indentedExplainer = new Explainer('  ');
        expect(indentedExplainer.explainQuery(query)).toMatchInlineSnapshot(`
            "  ignore global query

              filter by function \\
                   task.path === '{{query.file.path}}'
               =>
              filter by function task.path === '{{query.file.path}}' =>
              filter by function task.path === 'sample.md'

              not done

              (has start date) AND (description includes some) =>
                AND (All of):
                  has start date
                  description includes some

              group by function \\
                  task.path.includes('{{query.file.path}}')
               =>
              group by function task.path.includes('{{query.file.path}}') =>
              group by function task.path.includes('sample.md')

              group by priority reverse

              group by happens

              sort by function \\
                  task.path.includes('{{query.file.path}}')
               =>
              sort by function task.path.includes('{{query.file.path}}') =>
              sort by function task.path.includes('sample.md')

              sort by description reverse

              sort by path

              show urgency

              short mode

              At most 50 tasks.

              At most 3 tasks per group (if any "group by" options are supplied).

              NOTE: All sort instructions, including default sort order, are disabled, due to 'ignoreSortInstructions' setting.
            "
        `);
    });
});

describe('explain filters', () => {
    it('should explain 0 filters', () => {
        const source = '';
        const query = new Query(source);
        expect(explainer.explainFilters(query)).toMatchInlineSnapshot(`
            "No filters supplied. All tasks will match the query.
            "
        `);
    });

    it('should explain 1 filter', () => {
        const source = 'description includes hello';
        const query = new Query(source);
        expect(explainer.explainFilters(query)).toMatchInlineSnapshot(`
            "description includes hello
            "
        `);
    });

    it('should explain 2 filters', () => {
        const source = 'description includes hello\ndue 2012-01-23';
        const query = new Query(source);
        expect(explainer.explainFilters(query)).toMatchInlineSnapshot(`
            "description includes hello

            due 2012-01-23 =>
              due date is on 2012-01-23 (Monday 23rd January 2012)
            "
        `);
    });

    describe('white space around instruction', () => {
        it('should not duplicate query line with extra space - 1-line explanation', () => {
            const source = '            has done date    ';
            const query = new Query(source);
            expect(explainer.explainFilters(query)).toMatchInlineSnapshot(`
                "has done date
                "
            `);
        });

        it('should not duplicate query line with extra space - multi-line explanation', () => {
            const source = '            description regex matches /(buy|order)/i    ';
            const query = new Query(source);
            expect(explainer.explainFilters(query)).toMatchInlineSnapshot(`
                "description regex matches /(buy|order)/i =>
                  using regex:            '(buy|order)' with flag 'i'
                "
            `);
        });
    });
});

describe('explain groupers', () => {
    it('should explain "group by" options', () => {
        const source = 'group by due\ngroup by status.name reverse\ngroup by function task.description.toUpperCase()';
        const query = new Query(source);
        expect(explainer.explainGroups(query)).toMatchInlineSnapshot(`
            "group by due

            group by status.name reverse

            group by function task.description.toUpperCase()
            "
        `);
    });

    it('should explain a multi-line "group by function"', () => {
        const lines = [
            'group by function                                   ',
            '    const date = task.due;                          ',
            '    if (!date.moment) {                             ',
            '        return "Undated";                           ',
            '    }                                               ',
            '    if (date.moment.day() === 0) {                  ',
            '        {{! Put the Sunday group last: }}           ',
            '        return date.format("[%%][8][%%]dddd");      ',
            '    }                                               ',
            '    return date.format("[%%]d[%%]dddd");',
        ];
        const query = makeQueryFromContinuationLines(lines);

        expect(explainer.explainGroups(query)).toMatchInlineSnapshot(`
            "group by function                                   \\
                const date = task.due;                          \\
                if (!date.moment) {                             \\
                    return "Undated";                           \\
                }                                               \\
                if (date.moment.day() === 0) {                  \\
                    {{! Put the Sunday group last: }}           \\
                    return date.format("[%%][8][%%]dddd");      \\
                }                                               \\
                return date.format("[%%]d[%%]dddd");
             =>
            group by function const date = task.due; if (!date.moment) { return "Undated"; } if (date.moment.day() === 0) { {{! Put the Sunday group last: }} return date.format("[%%][8][%%]dddd"); } return date.format("[%%]d[%%]dddd"); =>
            group by function const date = task.due; if (!date.moment) { return "Undated"; } if (date.moment.day() === 0) {  return date.format("[%%][8][%%]dddd"); } return date.format("[%%]d[%%]dddd");
            "
        `);
        expect(query.grouping[0].instruction).toEqual(
            'group by function const date = task.due; if (!date.moment) { return "Undated"; } if (date.moment.day() === 0) {  return date.format("[%%][8][%%]dddd"); } return date.format("[%%]d[%%]dddd");',
        );
    });
});

describe('explain sorters', () => {
    it('should explain "sort by" options', () => {
        const source = 'sort by due\nsort by priority()';
        const query = new Query(source);
        // This shows the accidental presence of stray () characters after 'sort by priority'.
        // They are not *required* in the explanation, but are retained here to help in user support
        // when I ask users to supply an explanation of their query.
        expect(explainer.explainSorters(query)).toMatchInlineSnapshot(`
            "sort by due

            sort by priority()
            "
        `);
    });

    it('should explain a multi-line "sort by function"', () => {
        const lines = [
            'sort by function                                                   ',
            '    const priorities = [..."🟥🟧🟨🟩🟦"];                        ',
            '    for (let i = 0; i < priorities.length; i++) {                  ',
            '        if (task.description.includes(priorities[i])) return i;    ',
            '    }                                                              ',
            '    return 999;',
        ];
        const query = makeQueryFromContinuationLines(lines);

        expect(explainer.explainSorters(query)).toMatchInlineSnapshot(`
            "sort by function                                                   \\
                const priorities = [..."🟥🟧🟨🟩🟦"];                        \\
                for (let i = 0; i < priorities.length; i++) {                  \\
                    if (task.description.includes(priorities[i])) return i;    \\
                }                                                              \\
                return 999;
             =>
            sort by function const priorities = [..."🟥🟧🟨🟩🟦"]; for (let i = 0; i < priorities.length; i++) { if (task.description.includes(priorities[i])) return i; } return 999;
            "
        `);
        expect(query.sorting[0].instruction).toEqual(
            'sort by function const priorities = [..."🟥🟧🟨🟩🟦"]; for (let i = 0; i < priorities.length; i++) { if (task.description.includes(priorities[i])) return i; } return 999;',
        );
    });
});

describe('explain layout instructions', () => {
    function explainLayout(source: string) {
        const query = new Query(source);
        return explainer.explainLayout(query);
    }

    it('should explain hide due date', () => {
        expect(explainLayout('hide due date')).toEqual('hide due date\n');
    });

    it('should explain show tree', () => {
        expect(explainLayout('show tree')).toEqual('show tree\n');
    });

    it('should explain short mode', () => {
        expect(explainLayout('short')).toEqual('short\n');
        expect(explainLayout('short mode')).toEqual('short mode\n');
    });

    it('should explain full mode', () => {
        expect(explainLayout('full')).toEqual('full\n');
        expect(explainLayout('full mode')).toEqual('full mode\n');
    });

    it('should NOT explain explain', () => {
        // Intentionally do not explain the 'explain' instruction, as it just clutters up the documentation.
        expect(explainLayout('explain')).toEqual('');
    });
});

describe('explain limits', () => {
    it('should explain limit 5', () => {
        const source = 'limit 5';
        const query = new Query(source);
        expect(explainer.explainQueryLimits(query)).toMatchInlineSnapshot(`
            "At most 5 tasks.
            "
        `);
    });

    it('should explain limit 1', () => {
        const source = 'limit 1';
        const query = new Query(source);
        expect(explainer.explainQueryLimits(query)).toMatchInlineSnapshot(`
            "At most 1 task.
            "
        `);
    });

    it('should explain limit 0', () => {
        const source = 'limit 0';
        const query = new Query(source);
        expect(explainer.explainQueryLimits(query)).toMatchInlineSnapshot(`
            "At most 0 tasks.
            "
        `);
    });

    it('should explain group limit 4', () => {
        const source = 'limit groups 4';
        const query = new Query(source);
        expect(explainer.explainQueryLimits(query)).toMatchInlineSnapshot(`
            "At most 4 tasks per group (if any "group by" options are supplied).
            "
        `);
    });

    it('should explain all limit options', () => {
        const source = 'limit 127\nlimit groups to 8 tasks';
        const query = new Query(source);
        expect(explainer.explainQueryLimits(query)).toMatchInlineSnapshot(`
            "At most 127 tasks.

            At most 8 tasks per group (if any "group by" options are supplied).
            "
        `);
    });
});
