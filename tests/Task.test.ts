/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Status, Task } from '../src/Task';
import { getSettings, updateSettings } from '../src/Settings';

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

    type RecurrenceCase = {
        strict: boolean;
        interval: string;
        due?: string;
        scheduled?: string;
        start?: string;
        today?: string;
        nextDue?: string;
        nextScheduled?: string;
        nextStart?: string;
    };

    const recurrenceCases: Array<RecurrenceCase> = [
        {
            strict: true,
            interval: '7 days',
            due: '2021-02-21',
            nextDue: '2021-02-28',
        },
        {
            strict: false,
            interval: '7 days',
            due: '2021-02-21',
            today: '2021-02-18',
            nextDue: '2021-02-25',
        },
        {
            strict: false,
            interval: '7 days',
            due: '2021-02-21',
            today: '2021-02-22',
            nextDue: '2021-03-01',
        },
        {
            strict: true,
            interval: 'day',
            due: '2021-02-21',
            nextDue: '2021-02-22',
        },
        {
            strict: false,
            interval: 'day',
            due: '2021-02-21',
            today: '2022-01-04',
            nextDue: '2022-01-05',
        },
        {
            strict: true,
            interval: '4 weeks',
            due: '2021-10-15',
            nextDue: '2021-11-12',
        },
        {
            strict: true,
            interval: '4 weeks',
            due: '2021-10-12',
            nextDue: '2021-11-09',
        },
        {
            strict: true,
            interval: '4 weeks',
            due: '2022-10-12',
            nextDue: '2022-11-09',
        },
        {
            strict: true,
            interval: '4 weeks',
            due: '2033-10-12',
            nextDue: '2033-11-09',
        },
        {
            strict: false,
            interval: '3 weeks',
            due: '2022-01-10',
            today: '2021-01-14',
            nextDue: '2021-02-04',
        },
        {
            strict: true,
            interval: 'month',
            due: '2021-10-15',
            nextDue: '2021-11-15',
        },
        {
            strict: true,
            interval: 'month',
            due: '2021-10-18',
            nextDue: '2021-11-18',
        },
        {
            strict: false,
            interval: 'month',
            due: '2021-10-18',
            today: '2021-10-16',
            nextDue: '2021-11-16',
        },
        {
            strict: false,
            interval: 'month',
            due: '2021-10-18',
            today: '2021-10-24',
            nextDue: '2021-11-24',
        },
        {
            strict: true,
            interval: 'month on the 2nd Wednesday',
            due: '2021-09-08',
            nextDue: '2021-10-13',
        },
        {
            strict: false,
            interval: 'month on the 2nd Wednesday',
            due: '2021-09-08',
            today: '2021-09-15',
            nextDue: '2021-10-13',
        },
        {
            strict: false,
            interval: 'month on the 2nd Wednesday',
            due: '2021-09-08',
            today: '2021-10-12',
            nextDue: '2021-10-13',
        },
        {
            strict: false,
            interval: 'month on the 2nd Wednesday',
            due: '2021-09-08',
            today: '2021-10-13',
            nextDue: '2021-11-10',
        },
        {
            strict: true,
            interval: '3 months on the 3rd Thursday',
            due: '2021-04-15',
            nextDue: '2021-07-15',
        },
        {
            strict: true,
            interval: '3 months on the 3rd Thursday',
            due: '2021-08-19',
            nextDue: '2021-11-18',
        },
        {
            strict: true,
            interval: '3 months on the 3rd Thursday',
            due: '2021-09-16',
            nextDue: '2021-12-16',
        },
        {
            strict: true,
            interval: 'week on Monday, Wednesday, Friday',
            due: '2022-01-24',
            nextDue: '2022-01-26',
        },
        {
            strict: false,
            interval: 'week on Monday, Wednesday, Friday',
            due: '2022-01-24',
            today: '2022-01-25',
            nextDue: '2022-01-26',
        },
        {
            strict: false,
            interval: 'week on Monday, Wednesday, Friday',
            due: '2022-01-24',
            today: '2022-01-26',
            nextDue: '2022-01-28',
        },
        {
            strict: true,
            interval: '5 days',
            start: '2021-10-10',
            nextStart: '2021-10-15',
        },
        {
            strict: true,
            interval: '5 days',
            scheduled: '2021-10-10',
            nextScheduled: '2021-10-15',
        },
        {
            strict: true,
            interval: '5 days',
            start: '2021-10-10',
            due: '2021-10-11',
            nextStart: '2021-10-15',
            nextDue: '2021-10-16',
        },
        {
            strict: true,
            interval: '5 days',
            scheduled: '2021-10-10',
            due: '2021-10-11',
            nextScheduled: '2021-10-15',
            nextDue: '2021-10-16',
        },
        {
            strict: true,
            interval: '5 days',
            start: '2021-10-09',
            scheduled: '2021-10-10',
            due: '2021-10-11',
            nextStart: '2021-10-14',
            nextScheduled: '2021-10-15',
            nextDue: '2021-10-16',
        },
        {
            strict: false,
            interval: '10 days',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-04',
            nextStart: '2021-10-10',
            nextScheduled: '2021-10-12',
            nextDue: '2021-10-14',
        },
        {
            strict: false,
            interval: '10 days',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-06',
            nextStart: '2021-10-12',
            nextScheduled: '2021-10-14',
            nextDue: '2021-10-16',
        },
        {
            strict: false,
            interval: '10 days',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-08',
            nextStart: '2021-10-14',
            nextScheduled: '2021-10-16',
            nextDue: '2021-10-18',
        },
        {
            strict: false,
            interval: '10 days',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-10',
            nextStart: '2021-10-16',
            nextScheduled: '2021-10-18',
            nextDue: '2021-10-20',
        },
    ];

    describe.each([
        [
            'enforceStrictRecurrence',
            { enforceStrictRecurrence: true, strict: true, prefix: 'every' },
        ],
        [
            'strict recurrence',
            {
                enforceStrictRecurrence: false,
                strict: true,
                prefix: 'strictly every',
            },
        ],
        [
            'lenient recurrence',
            { enforceStrictRecurrence: false, strict: false, prefix: 'every' },
        ],
    ])('w/ %s', (_, { enforceStrictRecurrence, strict, prefix }) => {
        const originalSettings = getSettings();

        beforeAll(() => {
            updateSettings({ enforceStrictRecurrence });
        });

        afterAll(() => {
            updateSettings(originalSettings);
        });

        const filteredCases: Array<RecurrenceCase> = recurrenceCases.filter(
            (rc) => rc.strict === strict,
        );

        test.concurrent.each<RecurrenceCase>(filteredCases)(
            'recurs correctly (%j)',
            ({
                interval,
                due,
                scheduled,
                start,
                today,
                nextDue,
                nextScheduled,
                nextStart,
            }) => {
                const todaySpy = jest
                    .spyOn(Date, 'now')
                    .mockReturnValue(moment(today).valueOf());

                const line = [
                    '- [ ] I am task',
                    `🔁 ${prefix} ${interval}`,
                    !!scheduled && `⏳ ${scheduled}`,
                    !!due && `📅 ${due}`,
                    !!start && `🛫 ${start}`,
                ]
                    .filter(Boolean)
                    .join(' ');

                const task = Task.fromLine({
                    line,
                    path: '',
                    precedingHeader: '',
                    sectionStart: 0,
                    sectionIndex: 0,
                });

                const nextTask: Task = task!.toggle()[0];

                expect(
                    nextTask.dueDate === null ||
                        nextTask.dueDate.isSame(nextDue),
                ).toBe(true);
                expect(
                    nextTask.scheduledDate === null ||
                        nextTask.scheduledDate.isSame(nextScheduled),
                ).toBe(true);
                expect(
                    nextTask.startDate === null ||
                        nextTask.startDate.isSame(nextStart),
                ).toBe(true);

                todaySpy.mockClear();
            },
        );
    });

    // describe.each([
    //     ['enforceStrictRecurrence', true, 'every'],
    //     ['strict', false, 'strictly every'],
    // ])('%s', (_, enforceStrictRecurrence, prefix) => {
    //     const originalSettings = getSettings();

    //     beforeAll(() => {
    //         updateSettings({ enforceStrictRecurrence });
    //     });

    //     afterAll(() => {
    //         updateSettings(originalSettings);
    //     });

    //     const text = (value: string): string => [prefix, value].join(' ');

    //     test.concurrent.each([
    //         {
    //             recurrence: text('7 days'),
    //             dueDate: '2021-02-21',
    //             expected: moment('2021-02-28'),
    //         },
    //         {
    //             recurrence: text('day'),
    //             dueDate: '2021-02-21',
    //             expected: moment('2021-02-22'),
    //         },
    //         {
    //             recurrence: text('4 weeks'),
    //             dueDate: '2021-10-15',
    //             expected: moment('2021-11-12'),
    //         },
    //         {
    //             recurrence: text('4 weeks'),
    //             dueDate: '2021-10-12',
    //             expected: moment('2021-11-09'),
    //         },
    //         {
    //             recurrence: text('4 weeks'),
    //             dueDate: '2022-10-12',
    //             expected: moment('2022-11-09'),
    //         },
    //         {
    //             recurrence: text('4 weeks'),
    //             dueDate: '2033-10-12',
    //             expected: moment('2033-11-09'),
    //         },
    //         {
    //             recurrence: text('month'),
    //             dueDate: '2021-10-15',
    //             expected: moment('2021-11-15'),
    //         },
    //         {
    //             recurrence: text('month'),
    //             dueDate: '2021-10-18',
    //             expected: moment('2021-11-18'),
    //         },
    //         {
    //             recurrence: text('month on the 2nd Wednesday'),
    //             dueDate: '2021-09-08',
    //             expected: moment('2021-10-13'),
    //         },
    //         {
    //             recurrence: text('3 months on the 3rd Thursday'),
    //             dueDate: '2021-04-15',
    //             expected: moment('2021-07-15'),
    //         },
    //         {
    //             recurrence: text('3 months on the 3rd Thursday'),
    //             dueDate: '2021-08-19',
    //             expected: moment('2021-11-18'),
    //         },
    //         {
    //             recurrence: text('3 months on the 3rd Thursday'),
    //             dueDate: '2021-09-16',
    //             expected: moment('2021-12-16'),
    //         },
    //     ])(
    //         'recurs with the correct next due date (%j)',
    //         async ({ recurrence, dueDate, expected }) => {
    //             const task = arrangeTask({
    //                 startDate: null,
    //                 scheduledDate: null,
    //                 dueDate: moment(dueDate),
    //                 recurrence,
    //             });
    //             const nextTask: Task = task.toggle()[0];

    //             expect(nextTask.dueDate?.isSame(expected)).toBe(true);
    //         },
    //     );
    // });

    // describe('loose', () => {
    //     const originalSettings = getSettings();

    //     beforeAll(() => {
    //         updateSettings({ enforceStrictRecurrence: false });
    //     });

    //     afterAll(() => {
    //         updateSettings(originalSettings);
    //     });

    //     test.concurrent.each([
    //         {
    //             recurrence: 'every 4 days',
    //             dueDate: moment('2021-10-01'),
    //             today: moment('2021-11-02'),
    //             expected: '2021-11-06',
    //         },
    //         {
    //             recurrence: 'every 3 weeks',
    //             dueDate: moment('2021-10-01'),
    //             today: moment('2021-11-07'),
    //             expected: '2021-11-28'
    //         },
    //         {
    //             recurrence: 'every month',
    //             dueDate: moment('2021-10-01'),
    //             today: moment('2021-10-12'),
    //             expected: '2021-11-12',
    //         },
    //         {
    //             recurrence: 'every week on Monday, Wednesday, Friday',
    //             dueDate: moment('2022-01-24'),
    //             today: moment('2021-01-25'),
    //             expected: moment('2021-01-26')
    //         }
    //     ])(
    //         'recurs with the correct next due date (%j)',
    //         async ({ recurrence, dueDate, today, expected }) => {
    //             const todaySpy = jest.spyOn(Date, 'now').mockReturnValue(today.valueOf());

    //             const task = arrangeTask({
    //                 startDate: null,
    //                 scheduledDate: null,
    //                 dueDate,
    //                 recurrence,
    //             });
    //             const nextTask: Task = task.toggle()[0];

    //             console.log(nextTask);

    //             expect(nextTask.dueDate?.isSame(expected)).toBe(true);

    //             todaySpy.mockClear();
    //         },
    //     );
    // });
});
