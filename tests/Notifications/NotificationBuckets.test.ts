/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Status } from '../../src/Statuses/Status';
import { bucketForReminderDateTime, groupTasksByBucket } from '../../src/Notifications/NotificationBuckets';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

// A Wednesday, so 'this week' and 'later' both have unambiguous same-week/next-week examples regardless of
// the locale's week-start day.
const now = moment('2024-01-17T10:00:00');

function taskAt(scheduledDate: string, reminderTime: string) {
    return new TaskBuilder().scheduledDate(scheduledDate).reminderTime(reminderTime).build();
}

describe('bucketForReminderDateTime', () => {
    it('should bucket a past instant as overdue, even earlier the same day', () => {
        expect(bucketForReminderDateTime(moment('2024-01-17T09:59:00'), now)).toEqual('overdue');
    });

    it('should bucket a past day as overdue', () => {
        expect(bucketForReminderDateTime(moment('2024-01-16T23:59:00'), now)).toEqual('overdue');
    });

    it('should bucket a later instant the same day as today', () => {
        expect(bucketForReminderDateTime(moment('2024-01-17T10:01:00'), now)).toEqual('today');
    });

    it('should bucket a later day in the same week as thisWeek', () => {
        expect(bucketForReminderDateTime(moment('2024-01-19T10:00:00'), now)).toEqual('thisWeek');
    });

    it('should bucket a day in a later week as later', () => {
        expect(bucketForReminderDateTime(moment('2024-01-24T10:00:00'), now)).toEqual('later');
    });
});

describe('groupTasksByBucket', () => {
    it('should exclude tasks with no reminder', () => {
        const task = new TaskBuilder().scheduledDate('2024-01-17').build();
        const groups = groupTasksByBucket([task], now);
        expect(Object.values(groups).flat()).toEqual([]);
    });

    it('should exclude completed and cancelled tasks even with a due reminder', () => {
        const done = new TaskBuilder().scheduledDate('2024-01-16').reminderTime('10:00').status(Status.DONE).build();
        const cancelled = new TaskBuilder()
            .scheduledDate('2024-01-16')
            .reminderTime('10:00')
            .status(Status.CANCELLED)
            .build();

        const groups = groupTasksByBucket([done, cancelled], now);

        expect(Object.values(groups).flat()).toEqual([]);
    });

    it('should place each task in the right bucket, sorted soonest-first within a bucket', () => {
        const overdueLater = taskAt('2024-01-16', '10:00');
        const overdueSoonest = taskAt('2024-01-15', '10:00');
        const today = taskAt('2024-01-17', '18:00');
        const thisWeek = taskAt('2024-01-19', '09:00');
        const later = taskAt('2024-01-24', '09:00');

        const groups = groupTasksByBucket([overdueLater, today, overdueSoonest, later, thisWeek], now);

        expect(groups.overdue).toEqual([overdueSoonest, overdueLater]);
        expect(groups.today).toEqual([today]);
        expect(groups.thisWeek).toEqual([thisWeek]);
        expect(groups.later).toEqual([later]);
    });
});
