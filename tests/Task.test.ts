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

describe('toggle', () => {
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

    test.concurrent.each([
        {
            recurrenceText: 'every 7 days',
            dueDate: '2021-02-21',
            expectedNextDueDate: moment('2021-02-28'),
        },
        {
            recurrenceText: 'every day',
            dueDate: '2021-02-21',
            expectedNextDueDate: moment('2021-02-22'),
        },
        {
            recurrenceText: 'every 4 weeks',
            dueDate: '2021-10-15',
            expectedNextDueDate: moment('2021-11-12'),
        },
        {
            recurrenceText: 'every 4 weeks',
            dueDate: '2021-10-12',
            expectedNextDueDate: moment('2021-11-09'),
        },
        {
            recurrenceText: 'every 4 weeks',
            dueDate: '2022-10-12',
            expectedNextDueDate: moment('2022-11-09'),
        },
        {
            recurrenceText: 'every 4 weeks',
            dueDate: '2033-10-12',
            expectedNextDueDate: moment('2033-11-09'),
        },
        {
            recurrenceText: 'every month',
            dueDate: '2021-10-15',
            expectedNextDueDate: moment('2021-11-15'),
        },
        {
            recurrenceText: 'every month',
            dueDate: '2021-10-18',
            expectedNextDueDate: moment('2021-11-18'),
        },
        {
            recurrenceText: 'every month on the 2nd Wednesday',
            dueDate: '2021-09-08',
            expectedNextDueDate: moment('2021-10-13'),
        },
        {
            recurrenceText: 'every 3 months on the 3rd Thursday',
            dueDate: '2021-04-15',
            expectedNextDueDate: moment('2021-07-15'),
        },
        {
            recurrenceText: 'every 3 months on the 3rd Thursday',
            dueDate: '2021-08-19',
            expectedNextDueDate: moment('2021-11-18'),
        },
        {
            recurrenceText: 'every 3 months on the 3rd Thursday',
            dueDate: '2021-09-16',
            expectedNextDueDate: moment('2021-12-16'),
        },
    ])(
        'recurs on the correct next date (%j)',
        async ({ recurrenceText, dueDate, expectedNextDueDate }) => {
            const task = Task.fromLine({
                line: `- [ ] I am task 🔁 ${recurrenceText} 📅 ${dueDate}`,
                path: '',
                precedingHeader: '',
                sectionStart: 0,
                sectionIndex: 0,
            });
            const nextTask: Task = task!.toggle()[0];

            expect(nextTask.dueDate?.isSame(expectedNextDueDate)).toStrictEqual(
                true,
            );
        },
    );
});
