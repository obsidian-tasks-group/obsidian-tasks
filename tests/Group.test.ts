/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { FilenameField } from '../src/Query/Filter/FilenameField';
import { Group } from '../src/Query/Group';
import type { Grouper } from '../src/Query/Grouper';
import type { GroupingProperty } from '../src/Query/Grouper';
import type { Task } from '../src/Task';
import { PathField } from '../src/Query/Filter/PathField';
import { TagsField } from '../src/Query/Filter/TagsField';
import { fromLine } from './TestHelpers';

window.moment = moment;

function checkGroupNamesOfTask(task: Task, property: GroupingProperty, expectedGroupNames: string[]) {
    const group = Group.getGroupNamesForTask(Group.fromGroupingProperty(property), task);
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
        const grouping = [new PathField().createGrouper()];
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
        const grouping: Grouper[] = [];
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
        const grouping = [new PathField().createGrouper()];

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

        const grouping = [new PathField().createGrouper()];
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

        const grouping = [new TagsField().createGrouper()];
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

        const grouping: Grouper[] = [Group.fromGroupingProperty('folder'), new FilenameField().createGrouper()];

        // Act
        const groups = Group.by(grouping, tasks);

        // Assert
        expect(groups.toString()).toMatchInlineSnapshot(`
            "
            Group names: [folder\\_a/folder\\_b/,[[file_c]]]
            #### folder\\_a/folder\\_b/
            ##### [[file_c]]
            - [ ] Task 3 - but path is 1st, alphabetically

            ---

            Group names: [folder\\_b/folder\\_c/,[[file_c]]]
            #### folder\\_b/folder\\_c/
            ##### [[file_c]]
            - [ ] Task 1 - but path is 2nd, alphabetically

            ---

            Group names: [folder\\_b/folder\\_c/,[[file_d]]]
            ##### [[file_d]]
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
            taskLine: '- [ ] xxx', // no location supplied
            expectedGroupNames: ['Unknown Location'],
            precedingHeading: 'heading',
        },
        {
            groupBy: 'backlink',
            taskLine: '- [ ] xxx', // no heading supplied
            expectedGroupNames: ['c'],
            path: 'a/b/c.md',
        },
        {
            groupBy: 'backlink',
            taskLine: '- [ ] xxx',
            expectedGroupNames: ['c > heading'],
            path: 'a/b/c.md',
            precedingHeading: 'heading',
        },
        {
            groupBy: 'backlink',
            taskLine: '- [ ] xxx',
            expectedGroupNames: ['c'], // If file name and heading are identical, avoid duplication ('c > c')
            path: 'a/b/c.md',
            precedingHeading: 'c',
        },
        {
            groupBy: 'backlink',
            taskLine: '- [ ] xxx',
            // underscores in file name component are escaped
            // but underscores in the heading component are not
            expectedGroupNames: ['\\_c\\_ > heading _italic text_'],
            path: 'a/b/_c_.md',
            precedingHeading: 'heading _italic text_',
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
            groupBy: 'folder',
            taskLine: '- [ ] a',
            expectedGroupNames: ['a/\\_b\\_/'], // underscores in folder names are escaped
            path: 'a/_b_/c.md',
        },
        {
            // file in root of vault:
            groupBy: 'folder',
            taskLine: '- [ ] a',
            expectedGroupNames: ['/'],
            path: 'a.md',
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
            expectedGroupNames: ['\\_g\\_/'], // underscores in root folder names are escaped
            path: '_g_/h/i.md',
        },
        {
            groupBy: 'root',
            taskLine: '- [ ] a',
            expectedGroupNames: ['a/'],
            path: 'a\\b\\c.md', // Windows path
        },
        {
            // file in root of vault:
            groupBy: 'root',
            taskLine: '- [ ] a',
            expectedGroupNames: ['/'],
            path: 'a.md',
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
