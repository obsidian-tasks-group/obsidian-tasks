/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Recurrence } from '../src/Recurrence';
import { Task } from '../src/Task';

jest.mock('obsidian');
window.moment = moment;

describe('Recurrence', () => {
    it('creates a recurring instance even if no date is given', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every week',
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next).toStrictEqual({
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        });
    });

    type RecurrenceCase = {
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
            interval: 'every 7 days',
            due: '2021-02-21',
            nextDue: '2021-02-28',
        },
        {
            interval: 'every 7 days when done',
            due: '2021-02-21',
            today: '2021-02-18',
            nextDue: '2021-02-25',
        },
        {
            interval: 'every 7 days when done',
            due: '2021-02-21',
            today: '2021-02-22',
            nextDue: '2021-03-01',
        },
        {
            interval: 'every day',
            due: '2021-02-21',
            nextDue: '2021-02-22',
        },
        {
            interval: 'every day when done',
            due: '2021-02-21',
            today: '2022-01-04',
            nextDue: '2022-01-05',
        },
        {
            interval: 'every 4 weeks',
            due: '2021-10-15',
            nextDue: '2021-11-12',
        },
        {
            interval: 'every 4 weeks',
            due: '2021-10-12',
            nextDue: '2021-11-09',
        },
        {
            interval: 'every 4 weeks',
            due: '2022-10-12',
            nextDue: '2022-11-09',
        },
        {
            interval: 'every 4 weeks',
            due: '2033-10-12',
            nextDue: '2033-11-09',
        },
        {
            interval: 'every 3 weeks when done',
            due: '2022-01-10',
            today: '2021-01-14',
            nextDue: '2021-02-04',
        },
        {
            interval: 'every month',
            due: '2021-10-15',
            nextDue: '2021-11-15',
        },
        {
            interval: 'every month',
            due: '2021-10-18',
            nextDue: '2021-11-18',
        },
        {
            interval: 'every month when done',
            due: '2021-10-18',
            today: '2021-10-16',
            nextDue: '2021-11-16',
        },
        {
            interval: 'every month when done',
            due: '2021-10-18',
            today: '2021-10-24',
            nextDue: '2021-11-24',
        },
        {
            interval: 'every month on the 2nd Wednesday',
            due: '2021-09-08',
            nextDue: '2021-10-13',
        },
        {
            interval: 'every month on the 2nd Wednesday when done',
            due: '2021-09-08',
            today: '2021-09-15',
            nextDue: '2021-10-13',
        },
        {
            interval: 'every month on the 2nd Wednesday when done',
            due: '2021-09-08',
            today: '2021-10-12',
            nextDue: '2021-10-13',
        },
        {
            interval: 'every month on the 2nd Wednesday when done',
            due: '2021-09-08',
            today: '2021-10-13',
            nextDue: '2021-11-10',
        },
        {
            interval: 'every 3 months on the 3rd Thursday',
            due: '2021-04-15',
            nextDue: '2021-07-15',
        },
        {
            interval: 'every 3 months on the 3rd Thursday',
            due: '2021-08-19',
            nextDue: '2021-11-18',
        },
        {
            interval: 'every 3 months on the 3rd Thursday',
            due: '2021-09-16',
            nextDue: '2021-12-16',
        },
        {
            interval: 'every week on Monday, Wednesday, Friday',
            due: '2022-01-24',
            nextDue: '2022-01-26',
        },
        {
            interval: 'every week on Monday, Wednesday, Friday when done',
            due: '2022-01-24',
            today: '2022-01-25',
            nextDue: '2022-01-26',
        },
        {
            interval: 'every week on Monday, Wednesday, Friday when done',
            due: '2022-01-24',
            today: '2022-01-26',
            nextDue: '2022-01-28',
        },
        {
            interval: 'every 5 days',
            start: '2021-10-10',
            nextStart: '2021-10-15',
        },
        {
            interval: 'every 5 days',
            scheduled: '2021-10-10',
            nextScheduled: '2021-10-15',
        },
        {
            interval: 'every 5 days',
            start: '2021-10-10',
            due: '2021-10-11',
            nextStart: '2021-10-15',
            nextDue: '2021-10-16',
        },
        {
            interval: 'every 5 days',
            scheduled: '2021-10-10',
            due: '2021-10-11',
            nextScheduled: '2021-10-15',
            nextDue: '2021-10-16',
        },
        {
            interval: 'every 5 days',
            start: '2021-10-09',
            scheduled: '2021-10-10',
            due: '2021-10-11',
            nextStart: '2021-10-14',
            nextScheduled: '2021-10-15',
            nextDue: '2021-10-16',
        },
        {
            interval: 'every 10 days when done',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-04',
            nextStart: '2021-10-10',
            nextScheduled: '2021-10-12',
            nextDue: '2021-10-14',
        },
        {
            interval: 'every 10 days when done',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-06',
            nextStart: '2021-10-12',
            nextScheduled: '2021-10-14',
            nextDue: '2021-10-16',
        },
        {
            interval: 'every 10 days when done',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-08',
            nextStart: '2021-10-14',
            nextScheduled: '2021-10-16',
            nextDue: '2021-10-18',
        },
        {
            interval: 'every 10 days when done',
            start: '2021-10-05',
            scheduled: '2021-10-07',
            due: '2021-10-09',
            today: '2021-10-10',
            nextStart: '2021-10-16',
            nextScheduled: '2021-10-18',
            nextDue: '2021-10-20',
        },
    ];

    test.concurrent.each<RecurrenceCase>(recurrenceCases)(
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
                `🔁 ${interval}`,
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

            expect({
                nextDue: nextTask.dueDate?.format('YYYY-MM-DD'),
                nextScheduled: nextTask.scheduledDate?.format('YYYY-MM-DD'),
                nextStart: nextTask.startDate?.format('YYYY-MM-DD'),
            }).toMatchObject({
                nextDue,
                nextScheduled,
                nextStart,
            });

            expect(nextTask.recurrence?.toText()).toBe(interval);

            todaySpy.mockClear();
        },
    );
});
