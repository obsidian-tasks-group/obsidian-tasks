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
import { DueDateField } from '../src/Query/Filter/DueDateField';
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
        const grouping = [new PathField().createNormalGrouper()];
        const groups = new TaskGroups(grouping, inputs);

        // Assert
        expect(groups.groupers).toStrictEqual(grouping);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - path

            Group names: [file1]
            #### [path] file1
            - [ ] b
            - [ ] c

            ---

            Group names: [file2]
            #### [path] file2
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
            "Groupers (if any):

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
        const grouping = [new PathField().createNormalGrouper()];

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

        const grouping = [new PathField().createNormalGrouper()];
        const groups = new TaskGroups(grouping, inputs);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - path

            Group names: [a/b/c]
            #### [path] a/b/c
            - [ ] first file path, alphabetically

            ---

            Group names: [b/c/d]
            #### [path] b/c/d
            - [ ] second file path

            ---

            Group names: [d/e/f]
            #### [path] d/e/f
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

        const grouping = [new FilenameField().createNormalGrouper()];
        const groups = new TaskGroups(grouping, inputs);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - filename

            Group names: [[[9 something]]]
            #### [filename] [[9 something]]
            - [ ] first, as 9 is less then 10

            ---

            Group names: [[[10 something]]]
            #### [filename] [[10 something]]
            - [ ] second, as 10 is more than 9

            ---

            2 tasks
            "
        `);
    });

    it('sorts due date group headings in reverse', () => {
        // Arrange
        const a = fromLine({ line: '- [ ] a 📅 2023-04-05', path: '2.md' });
        const b = fromLine({ line: '- [ ] b 📅 2023-07-08', path: '3.md' });
        const inputs = [a, b];

        // Act
        const grouping: Grouper[] = [new DueDateField().createGrouperFromLine('group by due reverse')!];
        const groups = new TaskGroups(grouping, inputs);

        // Assert
        // No grouping specified, so no headings generated
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - due reverse

            Group names: [2023-07-08 Saturday]
            #### [due] 2023-07-08 Saturday
            - [ ] b 📅 2023-07-08

            ---

            Group names: [2023-04-05 Wednesday]
            #### [due] 2023-04-05 Wednesday
            - [ ] a 📅 2023-04-05

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

        const grouping = [new TagsField().createNormalGrouper()];
        const groups = new TaskGroups(grouping, inputs);
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - tags

            Group names: [#group1]
            #### [tags] #group1
            - [ ] Task 1 #group1
            - [ ] Task 2 #group2 #group1

            ---

            Group names: [#group2]
            #### [tags] #group2
            - [ ] Task 2 #group2 #group1
            - [ ] Task 3 #group2

            ---

            3 tasks
            "
        `);
    });

    it('should create nested headings if multiple groups used even if one is reversed', () => {
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

        const grouping: Grouper[] = [
            new FolderField().createReverseGrouper(),
            new FilenameField().createNormalGrouper(),
        ];

        // Act
        const groups = new TaskGroups(grouping, tasks);

        // Assert
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - folder reverse
            - filename

            Group names: [folder\\_b/folder\\_c/,[[file_c]]]
            #### [folder] folder\\_b/folder\\_c/
            ##### [filename] [[file_c]]
            - [ ] Task 1 - but path is 2nd, alphabetically

            ---

            Group names: [folder\\_b/folder\\_c/,[[file_d]]]
            ##### [filename] [[file_d]]
            - [ ] Task 2 - but path is 2nd, alphabetically

            ---

            Group names: [folder\\_a/folder\\_b/,[[file_c]]]
            #### [folder] folder\\_a/folder\\_b/
            ##### [filename] [[file_c]]
            - [ ] Task 3 - but path is 1st, alphabetically

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
            new StatusTypeField().createNormalGrouper(), // Two group levels
            new HappensDateField().createNormalGrouper(),
        ];
        const groups = new TaskGroups(grouping, inputs);
        // This result is incorrect. The '2 TODO' heading is shown before
        // the last group instead of before the first one.
        expect(groups.toString()).toMatchInlineSnapshot(`
            "Groupers (if any):
            - status.type
            - happens

            Group names: [2 TODO,2022-09-19 Monday]
            #### [status.type] 2 TODO
            ##### [happens] 2022-09-19 Monday
            - [ ] Task a - early date 📅 2022-09-19

            ---

            Group names: [2 TODO,2022-10-06 Thursday]
            ##### [happens] 2022-10-06 Thursday
            - [ ] Task c - intermediate date ⏳ 2022-10-06

            ---

            Group names: [2 TODO,2022-12-06 Tuesday]
            ##### [happens] 2022-12-06 Tuesday
            - [ ] Task b - later date ⏳ 2022-12-06

            ---

            3 tasks
            "
        `);
    });
});
