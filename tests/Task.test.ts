/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Moment } from 'moment';
import { Priority, Status, Task } from '../src/Task';
import { getSettings, updateSettings } from '../src/Settings';
import { Recurrence } from '../src/Recurrence';

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

    const arrangeTask = ({
        startDate,
        scheduledDate,
        dueDate,
        recurrence,
    }: {
        startDate: Moment | null;
        scheduledDate: Moment | null;
        dueDate: Moment | null;
        recurrence: string;
    }) => {
        return new Task({
            status: Status.Todo,
            description: 'example',
            path: '',
            indentation: '',
            sectionStart: 0,
            sectionIndex: 0,
            originalStatusCharacter: ' ',
            precedingHeader: '',
            priority: Priority.None,
            startDate,
            scheduledDate,
            dueDate,
            doneDate: null,
            recurrence: Recurrence.fromText({
                recurrenceRuleText: recurrence,
                startDate,
                scheduledDate,
                dueDate,
            }),
            blockLink: '',
        });
    };

    describe.each([
        ['enforceStrictRecurrence', true, 'every'],
        ['strict', false, 'strictly every'],
    ])('%s', (_, enforceStrictRecurrence, prefix) => {
        const originalSettings = getSettings();

        beforeAll(() => {
            updateSettings({ enforceStrictRecurrence });
        });

        afterAll(() => {
            updateSettings(originalSettings);
        });

        const text = (value: string): string => [prefix, value].join(' ');

        test.concurrent.each([
            {
                recurrence: text('7 days'),
                dueDate: '2021-02-21',
                expected: moment('2021-02-28'),
            },
            {
                recurrence: text('day'),
                dueDate: '2021-02-21',
                expected: moment('2021-02-22'),
            },
            {
                recurrence: text('4 weeks'),
                dueDate: '2021-10-15',
                expected: moment('2021-11-12'),
            },
            {
                recurrence: text('4 weeks'),
                dueDate: '2021-10-12',
                expected: moment('2021-11-09'),
            },
            {
                recurrence: text('4 weeks'),
                dueDate: '2022-10-12',
                expected: moment('2022-11-09'),
            },
            {
                recurrence: text('4 weeks'),
                dueDate: '2033-10-12',
                expected: moment('2033-11-09'),
            },
            {
                recurrence: text('month'),
                dueDate: '2021-10-15',
                expected: moment('2021-11-15'),
            },
            {
                recurrence: text('month'),
                dueDate: '2021-10-18',
                expected: moment('2021-11-18'),
            },
            {
                recurrence: text('month on the 2nd Wednesday'),
                dueDate: '2021-09-08',
                expected: moment('2021-10-13'),
            },
            {
                recurrence: text('3 months on the 3rd Thursday'),
                dueDate: '2021-04-15',
                expected: moment('2021-07-15'),
            },
            {
                recurrence: text('3 months on the 3rd Thursday'),
                dueDate: '2021-08-19',
                expected: moment('2021-11-18'),
            },
            {
                recurrence: text('3 months on the 3rd Thursday'),
                dueDate: '2021-09-16',
                expected: moment('2021-12-16'),
            },
        ])(
            'recurs with the correct next due date (%j)',
            async ({ recurrence, dueDate, expected }) => {
                const task = arrangeTask({
                    startDate: null,
                    scheduledDate: null,
                    dueDate: moment(dueDate),
                    recurrence,
                });
                const nextTask: Task = task.toggle()[0];

                expect(nextTask.dueDate?.isSame(expected)).toBe(true);
            },
        );
    });

    describe('loose', () => {
        const originalSettings = getSettings();

        beforeAll(() => {
            updateSettings({ enforceStrictRecurrence: false });
        });

        afterAll(() => {
            updateSettings(originalSettings);
        });

        const offset = (
            delta: moment.DurationInputArg1,
            unit: moment.unitOfTime.DurationConstructor,
        ): Moment => {
            const date = moment().startOf('day');
            date.add(delta, unit);
            return date;
        };

        test.concurrent.each([
            {
                recurrence: 'every 4 days',
                dueDate: moment('2021-10-01'),
                expected: offset(4, 'days'),
            },
            {
                recurrence: 'every 3 weeks',
                dueDate: moment('2021-10-01'),
                expected: offset(3, 'weeks'),
            },
            {
                recurrence: 'every month',
                dueDate: moment('2021-10-01'),
                expected: offset(1, 'month'),
            },
        ])(
            'recurs with the correct next due date (%j)',
            async ({ recurrence, dueDate, expected }) => {
                const task = arrangeTask({
                    startDate: null,
                    scheduledDate: null,
                    dueDate,
                    recurrence,
                });
                const nextTask: Task = task.toggle()[0];

                expect(nextTask.dueDate?.isSame(expected)).toBe(true);
            },
        );
    });
});
