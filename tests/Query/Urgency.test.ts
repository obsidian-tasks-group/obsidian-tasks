/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { Urgency } from '../../src/Urgency';
import { Priority } from '../../src/Task';
import { DateParser } from '../../src/Query/DateParser';

window.moment = moment;

function testUrgency(builder: TaskBuilder, expectedScore: number) {
    const task = builder.build();
    expect(Urgency.calculate(task)).toBeCloseTo(expectedScore, 5); // 5 digits after decimal point
}

function testUrgencyOnDate(
    today: string,
    builder: TaskBuilder,
    expectedScore: number,
) {
    // TODO Remove this duplication from Task.test.ts
    const todaySpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(moment(today).valueOf());

    testUrgency(builder, expectedScore);

    todaySpy.mockClear();
}

function calculateRelativeDate(today: string, daysInFuture: number) {
    const todayAsDate = DateParser.parseDate(today);
    const relativeDate = todayAsDate.add(daysInFuture, 'd');
    return relativeDate.format('YYYY-MM-DD');
}

function testUrgencyForDueDate(daysToDate: number, expectedScore: number) {
    // Priority Low adds zero to the score, which means the code
    // below clearer
    const lowPriority = new TaskBuilder().priority(Priority.Low);

    const today = '2022-10-31';
    const dueAsString = calculateRelativeDate(today, daysToDate);

    testUrgencyOnDate(today, lowPriority.dueDate(dueAsString), expectedScore);
}

describe('urgency - priority component', () => {
    it('should score correctly for priority', () => {
        const builder = new TaskBuilder();
        testUrgency(builder.priority(Priority.High), 6.0);
        testUrgency(builder.priority(Priority.Medium), 3.9);
        testUrgency(builder.priority(Priority.None), 1.95);
        testUrgency(builder.priority(Priority.Low), 0.0);
    });
});

describe('urgency - due date component', () => {
    it('More than 7 days overdue: 12.0', () => {
        testUrgencyForDueDate(-200, 12.0);
        testUrgencyForDueDate(-8, 12.0);
    });

    it('Due between 7 days ago and in 14 days: Range of 12.0 to 0.2', () => {
        testUrgencyForDueDate(-7, 12.0);
        testUrgencyForDueDate(0, 8.8); // documentation says: 9.0 for "today"
        testUrgencyForDueDate(1, 8.34286);
        testUrgencyForDueDate(6, 6.05714);
        testUrgencyForDueDate(13, 2.85714);
        testUrgencyForDueDate(14, 2.4); // documentation says: 0.2
    });

    it('More than 14 days until due: 0.2', () => {
        testUrgencyForDueDate(15, 2.4); // // documentation says: 0.2
        testUrgencyForDueDate(40, 2.4); // // documentation says: 0.2
        testUrgencyForDueDate(200, 2.4); // // documentation says: 0.2
    });

    it('not due: 0.0', () => {
        const lowPriority = new TaskBuilder().priority(Priority.Low);
        testUrgency(lowPriority.dueDate(null), 0.0);
    });
});

describe('urgency - scheduled date component', () => {
    // Priority Low adds zero to the score, which means the code
    // below clearer
    const lowPriority = new TaskBuilder().priority(Priority.Low);

    it('scheduled Today or earlier: 5.0', () => {
        testUrgencyOnDate(
            '2022-01-23',
            lowPriority.scheduledDate('2022-01-23'), // today
            5.0,
        );
        testUrgencyOnDate(
            '2022-01-23',
            lowPriority.scheduledDate('2022-01-01'), // earlier than today
            5.0,
        );
    });

    it('scheduled Tomorrow or later: 0.0', () => {
        testUrgencyOnDate(
            '2007-01-24',
            lowPriority.scheduledDate('2007-01-25'), // tomorrow
            0.0,
        );
        testUrgencyOnDate(
            '2007-01-24',
            lowPriority.scheduledDate('2007-05-31'), // later
            0.0,
        );
    });

    it('not scheduled: 0.0', () => {
        testUrgency(lowPriority.scheduledDate(null), 0.0);
    });
});

describe('urgency - start date component', () => {
    // Priority Low adds zero to the score, which means the code
    // below clearer
    const lowPriority = new TaskBuilder().priority(Priority.Low);

    it('start Today or earlier: 0.0', () => {
        testUrgencyOnDate(
            '2022-01-23',
            lowPriority.startDate('2022-01-23'), // today
            0.0,
        );
        testUrgencyOnDate(
            '2022-01-23',
            lowPriority.startDate('2022-01-01'), // earlier than today
            0.0,
        );
    });

    it('start Tomorrow or later: -3.0', () => {
        testUrgencyOnDate(
            '2007-01-24',
            lowPriority.startDate('2007-01-25'), // tomorrow
            -3.0,
        );
        testUrgencyOnDate(
            '2007-01-24',
            lowPriority.startDate('2007-05-31'), // later
            -3.0,
        );
    });

    it('not scheduled: 0.0', () => {
        testUrgency(lowPriority.startDate(null), 0.0);
    });
});
