/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Group } from '../src/Query/Group';
import type { Grouping, GroupingProperty } from '../src/Query';
import type { Task } from '../src/Task';
import { fromLine } from './TestHelpers';

window.moment = moment;

function checkGroupNamesOfTask(
    task: Task,
    property: GroupingProperty,
    expectedGroupNames: string[],
) {
    const group = Group.getGroupNamesForTask(property, task);
    expect(group).toEqual(expectedGroupNames);
}

describe('Grouping tasks', () => {
    it('groups correctly by path', () => {
        // Arrange
        const a = fromLine({ line: '- [ ] a', path: 'file2.md' });
        const b = fromLine({ line: '- [ ] b', path: 'file1.md' });
        const c = fromLine({ line: '- [ ] c', path: 'file1.md' });
        const inputs = [a, b, c];

        // Act
        const groupBy: GroupingProperty = 'path';
        const grouping = [{ property: groupBy }];
        const groups = Group.by(grouping, inputs);

        // Assert
        expect(groups.toString()).toMatchInlineSnapshot(`
            "
            Group names: [file1]
            #### file1
            - [ ] b
            - [ ] c

            ---

            Group names: [file2]
            #### file2
            - [ ] a

            ---

            3 tasks
            "
        `);
    });

    it('groups correctly by default grouping', () => {
        // Arrange
        const a = fromLine({ line: '- [ ] a 📅 1970-01-01', path: '2.md' });
        const b = fromLine({ line: '- [ ] b 📅 1970-01-02', path: '3.md' });
        const c = fromLine({ line: '- [ ] c 📅 1970-01-02', path: '3.md' });
        const inputs = [a, b, c];

        // Act
        const grouping: Grouping[] = [];
        const groups = Group.by(grouping, inputs);

        // Assert
        // No grouping specified, so no headings generated
        expect(groups.toString()).toMatchInlineSnapshot(`
            "
            Group names: []
            - [ ] a 📅 1970-01-01
            - [ ] b 📅 1970-01-02
            - [ ] c 📅 1970-01-02

            ---

            3 tasks
            "
        `);
    });

    it('groups empty task list correctly', () => {
        // Arrange
        const inputs: Task[] = [];
        const group_by: GroupingProperty = 'path';
        const grouping = [{ property: group_by }];

        // Act
        const groups = Group.by(grouping, inputs);

        // Assert
        expect(groups.groups.length).toEqual(1);
        expect(groups.groups[0].groups.length).toEqual(0);
        expect(groups.groups[0].tasks.length).toEqual(0);
    });

    it('sorts group names correctly', () => {
        const a = fromLine({
            line: '- [ ] third file path',
            path: 'd/e/f.md',
        });
        const b = fromLine({
            line: '- [ ] second file path',
            path: 'b/c/d.md',
        });
        const c = fromLine({
            line: '- [ ] first file path, alphabetically',
            path: 'a/b/c.md',
        });
        const inputs = [a, b, c];

        const group_by: GroupingProperty = 'path';
        const grouping = [{ property: group_by }];
        const groups = Group.by(grouping, inputs);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "
            Group names: [a/b/c]
            #### a/b/c
            - [ ] first file path, alphabetically

            ---

            Group names: [b/c/d]
            #### b/c/d
            - [ ] second file path

            ---

            Group names: [d/e/f]
            #### d/e/f
            - [ ] third file path

            ---

            3 tasks
            "
        `);
    });

    it('handles tasks matching multiple groups correctly', () => {
        const a = fromLine({
            line: '- [ ] Task 1 #group1',
        });
        const b = fromLine({
            line: '- [ ] Task 2 #group2 #group1',
        });
        const c = fromLine({
            line: '- [ ] Task 3 #group2',
        });
        const inputs = [a, b, c];

        const group_by: GroupingProperty = 'tags';
        const grouping = [{ property: group_by }];
        const groups = Group.by(grouping, inputs);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "
            Group names: [#group1]
            #### #group1
            - [ ] Task 1 #group1
            - [ ] Task 2 #group2 #group1

            ---

            Group names: [#group2]
            #### #group2
            - [ ] Task 2 #group2 #group1
            - [ ] Task 3 #group2

            ---

            3 tasks
            "
        `);
    });

    it('should create nested headings if multiple groups used', () => {
        // Arrange
        const t1 = fromLine({
            line: '- [ ] Task 1 - but path is 2nd, alphabetically',
            path: 'folder_b/folder_c/file_c.md',
        });
        const t2 = fromLine({
            line: '- [ ] Task 2 - but path is 2nd, alphabetically',
            path: 'folder_b/folder_c/file_d.md',
        });
        const t3 = fromLine({
            line: '- [ ] Task 3 - but path is 1st, alphabetically',
            path: 'folder_a/folder_b/file_c.md',
        });
        const tasks = [t1, t2, t3];

        const grouping: Grouping[] = [
            { property: 'folder' },
            { property: 'filename' },
        ];

        // Act
        const groups = Group.by(grouping, tasks);

        // Assert
        expect(groups.toString()).toMatchInlineSnapshot(`
            "
            Group names: [folder_a/folder_b/,file_c]
            #### folder_a/folder_b/
            ##### file_c
            - [ ] Task 3 - but path is 1st, alphabetically

            ---

            Group names: [folder_b/folder_c/,file_c]
            #### folder_b/folder_c/
            ##### file_c
            - [ ] Task 1 - but path is 2nd, alphabetically

            ---

            Group names: [folder_b/folder_c/,file_d]
            ##### file_d
            - [ ] Task 2 - but path is 2nd, alphabetically

            ---

            3 tasks
            "
        `);
    });
});

describe('Group names', () => {
    type GroupNameCase = {
        groupBy: GroupingProperty;
        taskLine: string;
        expectedGroupNames: string[];
        path?: string;
        precedingHeading?: string | null;
    };

    const groupNameCases: Array<GroupNameCase> = [
        // Maintenance Note: tests are in alphabetical order of 'groupBy' name

        // -----------------------------------------------------------
        // group by backlink
        {
            groupBy: 'backlink',
            taskLine: '- [ ] xxx',
            expectedGroupNames: ['c > heading'],
            path: 'a/b/c.md',
            precedingHeading: 'heading',
        },

        // -----------------------------------------------------------
        // group by done
        {
            groupBy: 'done',
            taskLine: '- [ ] a ✅ 1970-01-01',
            expectedGroupNames: ['1970-01-01 Thursday'],
        },
        {
            groupBy: 'done',
            taskLine: '- [ ] a',
            expectedGroupNames: ['No done date'],
        },

        // -----------------------------------------------------------
        // group by due
        {
            groupBy: 'due',
            taskLine: '- [ ] a 📅 1970-01-01',
            expectedGroupNames: ['1970-01-01 Thursday'],
        },
        {
            groupBy: 'due',
            taskLine: '- [ ] a',
            expectedGroupNames: ['No due date'],
        },

        // -----------------------------------------------------------
        // group by filename
        {
            groupBy: 'filename',
            taskLine: '- [ ] a',
            expectedGroupNames: ['c'],
            path: 'a/b/c.md',
        },

        // -----------------------------------------------------------
        // group by folder
        {
            groupBy: 'folder',
            taskLine: '- [ ] a',
            expectedGroupNames: ['a/b/'],
            path: 'a/b/c.md',
        },
        {
            // file in root of vault:
            groupBy: 'folder',
            taskLine: '- [ ] a',
            expectedGroupNames: ['/'],
            path: 'a.md',
        },

        // -----------------------------------------------------------
        // group by happens
        {
            groupBy: 'happens',
            taskLine: '- [ ] a',
            expectedGroupNames: ['No happens date'],
        },
        {
            groupBy: 'happens',
            taskLine: '- [ ] due is only date 📅 1970-01-01',
            expectedGroupNames: ['1970-01-01 Thursday'],
        },
        {
            groupBy: 'happens',
            taskLine: '- [ ] scheduled is only date ⏳ 1970-01-02',
            expectedGroupNames: ['1970-01-02 Friday'],
        },
        {
            groupBy: 'happens',
            taskLine: '- [ ] start is only date 🛫 1970-01-03',
            expectedGroupNames: ['1970-01-03 Saturday'],
        },
        {
            // Check that earliest date is prioritised: due
            groupBy: 'happens',
            taskLine:
                '- [ ] due is earliest date 🛫 1970-01-03 ⏳ 1970-01-02 📅 1970-01-01',
            expectedGroupNames: ['1970-01-01 Thursday'],
        },
        {
            // Check that earliest date is prioritised: scheduled
            groupBy: 'happens',
            taskLine:
                '- [ ] scheduled is earliest date 🛫 1970-01-03 ⏳ 1970-01-01 📅 1970-01-02',
            expectedGroupNames: ['1970-01-01 Thursday'],
        },
        {
            // Check that earliest date is prioritised: start
            groupBy: 'happens',
            taskLine:
                '- [ ] start is earliest date 🛫 1970-01-01 ⏳ 1970-01-02 📅 1970-01-03',
            expectedGroupNames: ['1970-01-01 Thursday'],
        },

        // -----------------------------------------------------------
        // group by heading
        {
            groupBy: 'heading',
            taskLine: '- [ ] xxx',
            expectedGroupNames: ['(No heading)'],
            precedingHeading: null,
        },
        {
            groupBy: 'heading',
            taskLine: '- [ ] xxx',
            expectedGroupNames: ['(No heading)'],
            precedingHeading: '',
        },
        {
            groupBy: 'heading',
            taskLine: '- [ ] xxx',
            expectedGroupNames: ['heading'],
            precedingHeading: 'heading',
        },

        // -----------------------------------------------------------
        // group by path
        {
            groupBy: 'path',
            taskLine: '- [ ] a',
            path: 'a/b/c.md',
            expectedGroupNames: ['a/b/c'],
        },

        // -----------------------------------------------------------
        // group by priority
        {
            groupBy: 'priority',
            taskLine: '- [ ] a ⏫',
            expectedGroupNames: ['Priority 1: High'],
        },
        {
            groupBy: 'priority',
            taskLine: '- [ ] a 🔼',
            expectedGroupNames: ['Priority 2: Medium'],
        },
        {
            groupBy: 'priority',
            taskLine: '- [ ] a',
            expectedGroupNames: ['Priority 3: None'],
        },
        {
            groupBy: 'priority',
            taskLine: '- [ ] a 🔽',
            expectedGroupNames: ['Priority 4: Low'],
        },

        // -----------------------------------------------------------
        // group by recurrence
        {
            groupBy: 'recurrence',
            taskLine: '- [ ] a',
            expectedGroupNames: ['None'],
        },
        {
            groupBy: 'recurrence',
            taskLine: '- [ ] a 🔁 every Sunday',
            expectedGroupNames: ['every week on Sunday'],
        },
        {
            groupBy: 'recurrence',
            taskLine: '- [ ] a 🔁 every Sunday when done',
            expectedGroupNames: ['every week on Sunday when done'],
        },
        {
            groupBy: 'recurrence',
            taskLine: '- [ ] a 🔁 every 6 months on the 2nd Wednesday',
            expectedGroupNames: ['every 6 months on the 2nd Wednesday'],
        },

        // -----------------------------------------------------------
        // group by recurring
        {
            groupBy: 'recurring',
            taskLine: '- [ ] a',
            expectedGroupNames: ['Not Recurring'],
        },
        {
            groupBy: 'recurring',
            taskLine: '- [ ] a 🔁 every Sunday',
            expectedGroupNames: ['Recurring'],
        },

        // -----------------------------------------------------------
        // group by root
        {
            groupBy: 'root',
            taskLine: '- [ ] a',
            expectedGroupNames: ['a/'],
            path: 'a/b/c.md',
        },
        {
            groupBy: 'root',
            taskLine: '- [ ] a',
            expectedGroupNames: ['a/'],
            path: 'a\\b\\c.md',
        },
        {
            // file in root of vault:
            groupBy: 'root',
            taskLine: '- [ ] a',
            expectedGroupNames: ['/'],
            path: 'a.md',
        },

        // -----------------------------------------------------------
        // group by scheduled
        {
            groupBy: 'scheduled',
            taskLine: '- [ ] a ⏳ 1970-01-01',
            expectedGroupNames: ['1970-01-01 Thursday'],
        },
        {
            groupBy: 'scheduled',
            taskLine: '- [ ] a',
            expectedGroupNames: ['No scheduled date'],
        },

        // -----------------------------------------------------------
        // group by start
        {
            groupBy: 'start',
            taskLine: '- [ ] a 🛫 1970-01-01',
            expectedGroupNames: ['1970-01-01 Thursday'],
        },
        {
            groupBy: 'start',
            taskLine: '- [ ] a',
            expectedGroupNames: ['No start date'],
        },

        // -----------------------------------------------------------
        // group by status
        {
            groupBy: 'status',
            taskLine: '- [ ] a',
            expectedGroupNames: ['Todo'],
        },
        {
            groupBy: 'status',
            taskLine: '- [x] a',
            expectedGroupNames: ['Done'],
        },

        // -----------------------------------------------------------
        // group by tags
        {
            groupBy: 'tags',
            taskLine: '- [ ] a #tag1',
            expectedGroupNames: ['#tag1'],
        },
        {
            groupBy: 'tags',
            taskLine: '- [ ] a #tag1 #tag2',
            expectedGroupNames: ['#tag1', '#tag2'],
        },
        {
            groupBy: 'tags',
            taskLine: '- [x] a',
            expectedGroupNames: ['(No tags)'],
        },

        // -----------------------------------------------------------
    ];

    test.concurrent.each<GroupNameCase>(groupNameCases)(
        'assigns correct group name (%j)',
        ({ groupBy, taskLine, path, expectedGroupNames, precedingHeading }) => {
            const task = fromLine({
                line: taskLine,
                path: path ? path : '',
                precedingHeader: precedingHeading,
            });
            checkGroupNamesOfTask(task, groupBy, expectedGroupNames);
        },
    );
});
