/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { Urgency } from '../../src/Urgency';
import { Priority } from '../../src/Task';
import { calculateRelativeDate } from '../TestingTools/DateTestHelpers';

window.moment = moment;

function testUrgency(builder: TaskBuilder, expectedScore: number) {
    const task = builder.build();
    expect(Urgency.calculate(task)).toBeCloseTo(expectedScore, 5); // 5 digits after decimal point
}

/**
 * Simulate the current date, then test the urgency for a task created by the builder
 * @param today
 * @param builder
 * @param expectedScore
 */
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

/**
 * Return a TaskBuilder to create a Task with Low Priority.
 *
 * Priority Low adds zero to the score, which means the
 * test for other parts of the priority calculation becomes clearer.
 */
function lowPriorityBuilder() {
    return new TaskBuilder().priority(Priority.Low);
}

// -----------------------------------------------------------------
// Priority tests

describe('urgency - priority component', () => {
    it('should score correctly for priority', () => {
        const builder = new TaskBuilder();
        testUrgency(builder.priority(Priority.High), 6.0);
        testUrgency(builder.priority(Priority.Medium), 3.9);
        testUrgency(builder.priority(Priority.None), 1.95);
        testUrgency(builder.priority(Priority.Low), 0.0);
    });
});

// -----------------------------------------------------------------
// Due Date tests

function testUrgencyForDueDate(daysToDate: number, expectedScore: number) {
    const today = '2022-10-15';
    const dueAsString = calculateRelativeDate(today, daysToDate);

    testUrgencyOnDate(
        today,
        lowPriorityBuilder().dueDate(dueAsString),
        expectedScore,
    );
}

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
        const lowPriority = lowPriorityBuilder();
        testUrgency(lowPriority.dueDate(null), 0.0);
    });
});

// -----------------------------------------------------------------
// Scheduled Date tests

function testUrgencyForScheduledDate(
    daysToDate: number,
    expectedScore: number,
) {
    const today = '2029-12-31';
    const scheduledAsString = calculateRelativeDate(today, daysToDate);

    testUrgencyOnDate(
        today,
        lowPriorityBuilder().scheduledDate(scheduledAsString),
        expectedScore,
    );
}

describe('urgency - scheduled date component', () => {
    const lowPriority = lowPriorityBuilder();

    it('scheduled Today or earlier: 5.0', () => {
        testUrgencyForScheduledDate(0, 5.0);
        testUrgencyForScheduledDate(-20, 5.0);
    });

    it('scheduled Tomorrow or later: 0.0', () => {
        testUrgencyForScheduledDate(1, 0.0);
        testUrgencyForScheduledDate(39, 0.0);
    });

    it('not scheduled: 0.0', () => {
        testUrgency(lowPriority.scheduledDate(null), 0.0);
    });
});

// -----------------------------------------------------------------
// Start Date tests

function testUrgencyForStartDate(daysToDate: number, expectedScore: number) {
    const today = '1997-03-27';
    const startAsString = calculateRelativeDate(today, daysToDate);

    testUrgencyOnDate(
        today,
        lowPriorityBuilder().startDate(startAsString),
        expectedScore,
    );
}

describe('urgency - start date component', () => {
    const lowPriority = lowPriorityBuilder();

    it('start Today or earlier: 0.0', () => {
        testUrgencyForStartDate(0, 0.0);
        testUrgencyForStartDate(-22, 0.0);
    });

    it('start Tomorrow or later: -3.0', () => {
        testUrgencyForStartDate(1, -3.0);
        testUrgencyForStartDate(67, -3.0);
    });

    it('not scheduled: 0.0', () => {
        testUrgency(lowPriority.startDate(null), 0.0);
    });
});
