/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Status, Task } from '../src/Task';

jest.mock('obsidian');
window.moment = moment;

describe('parsing', () => {
    it('parses a task from a line', () => {
        // Arrange
        const line = '- [x] this is a done task 🗓 2021-09-12 ✅ 2021-06-20';
        const path = 'this/is a path/to a/file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';

        // Act
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a done task');
        expect(task!.status).toStrictEqual(Status.Done);
        expect(task!.dueDate).not.toBeNull();
        expect(
            task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
        expect(task!.doneDate).not.toBeNull();
        expect(
            task!.doneDate!.isSame(moment('2021-06-20', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
    });

    it('allows signifier emojis as part of the description', () => {
        // Arrange
        const line = '- [x] this is a ✅ done task 🗓 2021-09-12 ✅ 2021-06-20';
        const path = 'this/is a path/to a/file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';

        // Act
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a ✅ done task');
        expect(task!.status).toStrictEqual(Status.Done);
        expect(task!.dueDate).not.toBeNull();
        expect(
            task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
        expect(task!.doneDate).not.toBeNull();
        expect(
            task!.doneDate!.isSame(moment('2021-06-20', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
    });

    it('also works with block links and trailing spaces', () => {
        // Arrange
        const line =
            '- [x] this is a ✅ done task 🗓 2021-09-12 ✅ 2021-06-20 ^my-precious  ';
        const path = 'this/is a path/to a/file.md';
        const sectionStart = 1337;
        const sectionIndex = 1209;
        const precedingHeader = 'Eloquent Section';

        // Act
        const task = Task.fromLine({
            line,
            path,
            sectionStart,
            sectionIndex,
            precedingHeader,
        });

        // Assert
        expect(task).not.toBeNull();
        expect(task!.description).toEqual('this is a ✅ done task');
        expect(task!.status).toStrictEqual(Status.Done);
        expect(task!.dueDate).not.toBeNull();
        expect(
            task!.dueDate!.isSame(moment('2021-09-12', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
        expect(task!.doneDate).not.toBeNull();
        expect(
            task!.doneDate!.isSame(moment('2021-06-20', 'YYYY-MM-DD')),
        ).toStrictEqual(true);
        expect(task!.blockLink).toEqual(' ^my-precious');
    });
});

describe('to string', () => {
    it('retains the block link', () => {
        // Arrange
        const line = '- [ ] this is a task 📅 2021-09-12 ^my-precious';

        // Act
        const task: Task = Task.fromLine({
            line,
            path: '',
            sectionStart: 0,
            sectionIndex: 0,
            precedingHeader: '',
        }) as Task;

        // Assert
        expect(task.toFileLineString()).toStrictEqual(line);
    });
});

describe('toggle done', () => {
    it('retains the block link', () => {
        // Arrange
        const line = '- [ ] this is a task 📅 2021-09-12 ^my-precious';

        // Act
        const task: Task = Task.fromLine({
            line,
            path: '',
            sectionStart: 0,
            sectionIndex: 0,
            precedingHeader: '',
        }) as Task;
        const toggled: Task = task.toggle()[0];

        // Assert
        expect(toggled).not.toBeNull();
        expect(toggled!.status).toStrictEqual(Status.Done);
        expect(toggled!.doneDate).not.toBeNull();
        expect(toggled!.blockLink).toEqual(' ^my-precious');
    });
});
