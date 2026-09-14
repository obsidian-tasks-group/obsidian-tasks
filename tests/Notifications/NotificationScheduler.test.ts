/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { ReminderCheckLoop, findDueReminders } from '../../src/Notifications/NotificationScheduler';
import { Status } from '../../src/Statuses/Status';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

function taskDueAt(scheduledDate: string, reminderTime: string) {
    return new TaskBuilder().scheduledDate(scheduledDate).reminderTime(reminderTime).build();
}

describe('findDueReminders', () => {
    const windowStart = moment('2024-01-15T10:00:00');
    const windowEnd = moment('2024-01-15T10:05:00');

    it('should include a reminder exactly at windowEnd', () => {
        const task = taskDueAt('2024-01-15', '10:05');
        expect(findDueReminders([task], windowStart, windowEnd)).toEqual([task]);
    });

    it('should exclude a reminder exactly at windowStart (half-open interval)', () => {
        const task = taskDueAt('2024-01-15', '10:00');
        expect(findDueReminders([task], windowStart, windowEnd)).toEqual([]);
    });

    it('should exclude a reminder before the window', () => {
        const task = taskDueAt('2024-01-15', '09:59');
        expect(findDueReminders([task], windowStart, windowEnd)).toEqual([]);
    });

    it('should exclude a reminder after the window', () => {
        const task = taskDueAt('2024-01-15', '10:06');
        expect(findDueReminders([task], windowStart, windowEnd)).toEqual([]);
    });

    it('should exclude a task with no reminder set', () => {
        const task = new TaskBuilder().scheduledDate('2024-01-15').build();
        expect(findDueReminders([task], windowStart, windowEnd)).toEqual([]);
    });

    it('should exclude a completed task even if its reminder is due', () => {
        const task = new TaskBuilder().scheduledDate('2024-01-15').reminderTime('10:02').status(Status.DONE).build();
        expect(findDueReminders([task], windowStart, windowEnd)).toEqual([]);
    });

    it('should exclude a cancelled task even if its reminder is due', () => {
        const task = new TaskBuilder()
            .scheduledDate('2024-01-15')
            .reminderTime('10:02')
            .status(Status.CANCELLED)
            .build();
        expect(findDueReminders([task], windowStart, windowEnd)).toEqual([]);
    });

    it('should only return the tasks actually due, from a mixed list', () => {
        const due = taskDueAt('2024-01-15', '10:03');
        const notYetDue = taskDueAt('2024-01-15', '10:30');
        const alreadyPast = taskDueAt('2024-01-15', '09:00');
        expect(findDueReminders([due, notYetDue, alreadyPast], windowStart, windowEnd)).toEqual([due]);
    });
});

describe('ReminderCheckLoop', () => {
    it('should not fire a reminder that was already due before the loop started', () => {
        const loop = new ReminderCheckLoop(moment('2024-01-15T10:00:00'));
        const task = taskDueAt('2024-01-15', '09:00'); // due before the loop was constructed

        const due = loop.tick([task], moment('2024-01-15T10:01:00'));

        expect(due).toEqual([]);
    });

    it('should fire a reminder exactly once, on the first tick whose window covers it', () => {
        const loop = new ReminderCheckLoop(moment('2024-01-15T10:00:00'));
        const task = taskDueAt('2024-01-15', '10:03');

        const firstTick = loop.tick([task], moment('2024-01-15T10:05:00'));
        const secondTick = loop.tick([task], moment('2024-01-15T10:10:00'));

        expect(firstTick).toEqual([task]);
        expect(secondTick).toEqual([]);
    });

    it('should never return the same task for the same instant across two consecutive ticks', () => {
        const loop = new ReminderCheckLoop(moment('2024-01-15T10:00:00'));
        const task = taskDueAt('2024-01-15', '10:02');

        const ticks = [
            loop.tick([task], moment('2024-01-15T10:01:00')),
            loop.tick([task], moment('2024-01-15T10:02:00')),
            loop.tick([task], moment('2024-01-15T10:03:00')),
        ];

        const totalFires = ticks.reduce((count, due) => count + due.length, 0);
        expect(totalFires).toEqual(1);
    });

    it('should let a later reminder on the same (edited) task fire in a subsequent window', () => {
        const loop = new ReminderCheckLoop(moment('2024-01-15T10:00:00'));
        const originalInstant = taskDueAt('2024-01-15', '10:02');
        loop.tick([originalInstant], moment('2024-01-15T10:03:00'));

        // Simulate the user editing the reminder to a later time (e.g. via SetReminderDateTime) -
        // a new instant, which should be free to fire on its own merits.
        const editedInstant = taskDueAt('2024-01-15', '10:08');
        const due = loop.tick([editedInstant], moment('2024-01-15T10:09:00'));

        expect(due).toEqual([editedInstant]);
    });

    it('should default lastCheckTime to construction time when no moment is given', () => {
        const before = moment();
        const loop = new ReminderCheckLoop();
        const after = moment();

        // A reminder due well before the loop was constructed must not fire on the very next tick.
        const staleTask = taskDueAt(before.format('YYYY-MM-DD'), before.clone().subtract(1, 'hour').format('HH:mm'));
        const due = loop.tick([staleTask], after);

        expect(due).toEqual([]);
    });
});
