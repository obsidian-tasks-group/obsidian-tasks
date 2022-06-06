/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Group } from '../src/Query/Group';
import type { Grouping, GroupingProperty } from '../src/Query';
import type { Task } from '../src/Task';
import { fromLine } from './TestHelpers';

window.moment = moment;

function checkGroupNameOfTask(
    task: Task,
    property: GroupingProperty,
    expectedGroupName: string,
) {
    const group = Group.getGroupNameForTask(property, task);
    expect(group).toEqual(expectedGroupName);
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
        expectedGroupName: string;
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
            expectedGroupName: 'c > heading',
            path: 'a/b/c.md',
            precedingHeading: 'heading',
        },

        // -----------------------------------------------------------
        // group by done
        {
            groupBy: 'done',
            taskLine: '- [ ] a ✅ 1970-01-01',
            expectedGroupName: '1970-01-01 Thursday',
        },
        {
            groupBy: 'done',
            taskLine: '- [ ] a',
            expectedGroupName: 'No done date',
        },

        // -----------------------------------------------------------
        // group by due
        {
            groupBy: 'due',
            taskLine: '- [ ] a 📅 1970-01-01',
            expectedGroupName: '1970-01-01 Thursday',
        },
        {
            groupBy: 'due',
            taskLine: '- [ ] a',
            expectedGroupName: 'No due date',
        },

        // -----------------------------------------------------------
        // group by filename
        {
            groupBy: 'filename',
            taskLine: '- [ ] a',
            expectedGroupName: 'c',
            path: 'a/b/c.md',
        },

        // -----------------------------------------------------------
        // group by folder
        {
            groupBy: 'folder',
            taskLine: '- [ ] a',
            expectedGroupName: 'a/b/',
            path: 'a/b/c.md',
        },
        {
            // file in root of vault:
            groupBy: 'folder',
            taskLine: '- [ ] a',
            expectedGroupName: '/',
            path: 'a.md',
        },

        // -----------------------------------------------------------
        // group by heading
        {
            groupBy: 'heading',
            taskLine: '- [ ] xxx',
            expectedGroupName: '(No heading)',
            precedingHeading: null,
        },
        {
            groupBy: 'heading',
            taskLine: '- [ ] xxx',
            expectedGroupName: '(No heading)',
            precedingHeading: '',
        },
        {
            groupBy: 'heading',
            taskLine: '- [ ] xxx',
            expectedGroupName: 'heading',
            precedingHeading: 'heading',
        },

        // -----------------------------------------------------------
        // group by path
        {
            groupBy: 'path',
            taskLine: '- [ ] a',
            path: 'a/b/c.md',
            expectedGroupName: 'a/b/c',
        },

        // -----------------------------------------------------------
        // group by scheduled
        {
            groupBy: 'scheduled',
            taskLine: '- [ ] a ⏳ 1970-01-01',
            expectedGroupName: '1970-01-01 Thursday',
        },
        {
            groupBy: 'scheduled',
            taskLine: '- [ ] a',
            expectedGroupName: 'No scheduled date',
        },

        // -----------------------------------------------------------
        // group by start
        {
            groupBy: 'start',
            taskLine: '- [ ] a 🛫 1970-01-01',
            expectedGroupName: '1970-01-01 Thursday',
        },
        {
            groupBy: 'start',
            taskLine: '- [ ] a',
            expectedGroupName: 'No start date',
        },

        // -----------------------------------------------------------
        // group by status
        {
            groupBy: 'status',
            taskLine: '- [ ] a',
            expectedGroupName: 'Todo',
        },
        {
            groupBy: 'status',
            taskLine: '- [x] a',
            expectedGroupName: 'Done',
        },

        // -----------------------------------------------------------
    ];

    test.concurrent.each<GroupNameCase>(groupNameCases)(
        'assigns correct group name (%j)',
        ({ groupBy, taskLine, path, expectedGroupName, precedingHeading }) => {
            const task = fromLine({
                line: taskLine,
                path: path ? path : '',
                precedingHeader: precedingHeading,
            });
            checkGroupNameOfTask(task, groupBy, expectedGroupName);
        },
    );
});
