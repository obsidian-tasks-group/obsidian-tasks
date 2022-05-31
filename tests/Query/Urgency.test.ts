/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { Urgency } from '../../src/Urgency';
import { Priority } from '../../src/Task';

window.moment = moment;

function testUrgency(builder: TaskBuilder, expectedScore: number) {
    const task = builder.build();
    expect(Urgency.calculate(task)).toBeCloseTo(expectedScore, 5); // 5 digits after decimal point
}

const testUrgencyOnDate = (
    today: string,
    builder: TaskBuilder,
    expectedScore: number,
) => {
    // TODO Remove this duplication from Task.test.ts
    const todaySpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(moment(today).valueOf());

    testUrgency(builder, expectedScore);

    todaySpy.mockClear();
};

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
    // Priority Low adds zero to the score, which means the code
    // below clearer
    const lowPriority = new TaskBuilder().priority(Priority.Low);

    it('More than 7 days overdue: 12.0', () => {
        testUrgencyOnDate(
            '2022-10-31',
            lowPriority.dueDate('2022-10-01'),
            12.0,
        );
    });

    it('Due between 7 days ago and in 14 days: Range of 12.0 to 0.2', () => {
        const today = '2022-10-31';
        testUrgencyOnDate(
            today, // today's date
            lowPriority.dueDate(today), // due date of task
            8.8, // documentation says this should be 9.0
        );
    });

    it('Due 7 days ago 12.0', () => {
        const today = '2022-10-08';
        const seven_days_ago = '2022-10-01';
        testUrgencyOnDate(
            today,
            lowPriority.dueDate(seven_days_ago),
            12, // documentation says this should be 9.0
        );
    });

    it('More than 14 days until due: 0.2', () => {
        testUrgencyOnDate(
            '2022-10-01',
            lowPriority.dueDate('2022-10-25'),
            2.4, // documentation says this should be 0.2
        );
    });

    it('not due: 0.0', () => {
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
