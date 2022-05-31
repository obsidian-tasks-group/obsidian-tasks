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

describe('urgency - scheduled date component', () => {
    // Priority Low adds zero to the score, which means the code
    // below clearer
    const lowPriority = new TaskBuilder().priority(Priority.Low);

    // Today or earlier: 5.0
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

    // Tomorrow or later: 0.0
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

    // None: 0.0
    testUrgency(lowPriority.scheduledDate(null), 0.0);
});
