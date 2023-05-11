/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { FilenameField } from '../src/Query/Filter/FilenameField';
import type { Grouper } from '../src/Query/Grouper';
import type { Task } from '../src/Task';
import { PathField } from '../src/Query/Filter/PathField';
import { TagsField } from '../src/Query/Filter/TagsField';
import { FolderField } from '../src/Query/Filter/FolderField';
import { TaskGroups } from '../src/Query/TaskGroups';
import { StatusTypeField } from '../src/Query/Filter/StatusTypeField';
import { HappensDateField } from '../src/Query/Filter/HappensDateField';
import { fromLine } from './TestHelpers';

window.moment = moment;

describe('Grouping tasks', () => {
    it('groups correctly by path', () => {
        // Arrange
        const a = fromLine({ line: '- [ ] a', path: 'file2.md' });
        const b = fromLine({ line: '- [ ] b', path: 'file1.md' });
        const c = fromLine({ line: '- [ ] c', path: 'file1.md' });
        const inputs = [a, b, c];

        // Act
        const grouping = [new PathField().createGrouper()];
        const groups = new TaskGroups(grouping, inputs);

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
        const groups = new TaskGroups(grouping, inputs);

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
        const groups = new TaskGroups(grouping, inputs);

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
        const groups = new TaskGroups(grouping, inputs);
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

    it('sorts group names beginning with numeric values correctly', () => {
        const a = fromLine({
            line: '- [ ] first, as 9 is less then 10',
            path: '9 something.md',
        });
        const b = fromLine({
            line: '- [ ] second, as 10 is more than 9',
            path: '10 something.md',
        });
        const inputs = [a, b];

        const grouping = [new FilenameField().createGrouper()];
        const groups = new TaskGroups(grouping, inputs);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "
            Group names: [[[9 something]]]
            #### [[9 something]]
            - [ ] first, as 9 is less then 10

            ---

            Group names: [[[10 something]]]
            #### [[10 something]]
            - [ ] second, as 10 is more than 9

            ---

            2 tasks
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
        const groups = new TaskGroups(grouping, inputs);
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

        const grouping: Grouper[] = [new FolderField().createGrouper(), new FilenameField().createGrouper()];

        // Act
        const groups = new TaskGroups(grouping, tasks);

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

    it('should create nested headings if multiple groups used - case 2', () => {
        const b = fromLine({
            line: '- [ ] Task a - early date 📅 2022-09-19',
        });
        const a = fromLine({
            line: '- [ ] Task b - later date ⏳ 2022-12-06',
        });
        const c = fromLine({
            line: '- [ ] Task c - intermediate date ⏳ 2022-10-06',
        });
        const inputs = [a, b, c];

        const grouping = [
            new StatusTypeField().createGrouper(), // Two group levels
            new HappensDateField().createGrouper(),
        ];
        const groups = new TaskGroups(grouping, inputs);
        // This result is incorrect. The '2 TODO' heading is shown before
        // the last group instead of before the first one.
        expect(groups.toString()).toMatchInlineSnapshot(`
            "
            Group names: [2 TODO,2022-09-19 Monday]
            #### 2 TODO
            ##### 2022-09-19 Monday
            - [ ] Task a - early date 📅 2022-09-19

            ---

            Group names: [2 TODO,2022-10-06 Thursday]
            ##### 2022-10-06 Thursday
            - [ ] Task c - intermediate date ⏳ 2022-10-06

            ---

            Group names: [2 TODO,2022-12-06 Tuesday]
            ##### 2022-12-06 Tuesday
            - [ ] Task b - later date ⏳ 2022-12-06

            ---

            3 tasks
            "
        `);
    });
});
