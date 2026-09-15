/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import {
    RemoveReminderTime,
    SetReminderDateTime,
    SetReminderTime,
} from '../../../src/ui/EditInstructions/ReminderInstructions';

window.moment = moment;

// A reminder anchors to Task.scheduledDate only - not due or start - so these fixtures use scheduledDate
// throughout. See the dedicated 'reminders anchor to scheduled date only' tests below for what happens
// when a task has due/start dates instead.
const taskWithNoReminder = new TaskBuilder().scheduledDate('2024-10-01').build();
const taskWithReminder = new TaskBuilder().scheduledDate('2024-10-01').reminderTime('09:00').build();

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-10-02T08:00:00'));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('SetReminderTime', () => {
    it('should provide a default display name', () => {
        const instruction = new SetReminderTime('09:00');
        expect(instruction.instructionDisplayName()).toEqual('Set reminder: 09:00');
    });

    it('should allow a custom display name', () => {
        const instruction = new SetReminderTime('09:00', 'Morning');
        expect(instruction.instructionDisplayName()).toEqual('Morning');
    });

    it('should report checked only for a task already at that reminder time', () => {
        const instruction = new SetReminderTime('09:00');
        expect(instruction.isCheckedForTask(taskWithNoReminder)).toEqual(false);
        expect(instruction.isCheckedForTask(taskWithReminder)).toEqual(true);
    });

    it('should set the reminder time on apply', () => {
        const instruction = new SetReminderTime('12:00');
        const [applied] = instruction.apply(taskWithNoReminder);
        expect(applied.reminderTime).toEqual('12:00');
    });

    it('should not change identity when applied to a task already at that time', () => {
        const instruction = new SetReminderTime('09:00');
        const [applied] = instruction.apply(taskWithReminder);
        expect(applied).toBe(taskWithReminder);
    });

    it("should create today's scheduled date as the anchor, if the task has none", () => {
        const task = new TaskBuilder().build();
        const instruction = new SetReminderTime('09:00');

        const [applied] = instruction.apply(task);

        expect(applied.reminderTime).toEqual('09:00');
        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-02');
        expect(applied.dueDate).toBeNull();
        expect(applied.startDate).toBeNull();
    });

    it('should report a task with no anchor date as unchecked, even if its reminder time already matches', () => {
        // Applying would still add an anchor date - see apply() above - so this isn't a no-op.
        const task = new TaskBuilder().reminderTime('09:00').build();
        const instruction = new SetReminderTime('09:00');

        expect(instruction.isCheckedForTask(task)).toEqual(false);
    });

    it("should create today's scheduled date even when the task already has a due date (reminders only ever anchor to scheduled date)", () => {
        const task = new TaskBuilder().dueDate('2024-10-10').build();
        const instruction = new SetReminderTime('09:00');

        const [applied] = instruction.apply(task);

        expect(applied.reminderTime).toEqual('09:00');
        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-02');
        // The due date is untouched - it was never the anchor.
        expect(applied.dueDate!.format('YYYY-MM-DD')).toEqual('2024-10-10');
    });
});

describe('SetReminderDateTime', () => {
    it('should provide a default display name', () => {
        const instruction = new SetReminderDateTime(moment('2024-10-01T09:00'));
        expect(instruction.instructionDisplayName()).toEqual('Set reminder: 09:00');
    });

    it('should only set the time when the target date matches the existing scheduled date', () => {
        const task = new TaskBuilder().scheduledDate('2024-10-01').build();
        const instruction = new SetReminderDateTime(moment('2024-10-01T14:30'));

        const [applied] = instruction.apply(task);

        expect(applied.reminderTime).toEqual('14:30');
        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-01');
    });

    it('should shift the scheduled date forward when the target date crosses into the next day', () => {
        const task = new TaskBuilder().scheduledDate('2024-10-01').build();
        const instruction = new SetReminderDateTime(moment('2024-10-02T00:30'));

        const [applied] = instruction.apply(task);

        expect(applied.reminderTime).toEqual('00:30');
        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-02');
    });

    it('should ignore due and start dates entirely, and never shift or create anything but scheduled date', () => {
        const task = new TaskBuilder().dueDate('2024-10-01').startDate('2024-09-01').build();
        const instruction = new SetReminderDateTime(moment('2024-10-02T00:30'));

        const [applied] = instruction.apply(task);

        expect(applied.reminderTime).toEqual('00:30');
        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-02');
        // Neither pre-existing date is touched - they were never candidates for the anchor.
        expect(applied.dueDate!.format('YYYY-MM-DD')).toEqual('2024-10-01');
        expect(applied.startDate!.format('YYYY-MM-DD')).toEqual('2024-09-01');
    });

    it("should create the target's own date as the scheduled-date anchor, if the task has none", () => {
        const task = new TaskBuilder().build();
        const instruction = new SetReminderDateTime(moment('2024-10-02T00:30'));

        const [applied] = instruction.apply(task);

        expect(applied.reminderTime).toEqual('00:30');
        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-02');
        expect(applied.dueDate).toBeNull();
        expect(applied.startDate).toBeNull();
    });

    it('should report a task with no anchor date as unchecked, even if its reminder time already matches', () => {
        // Applying would still add an anchor date - see apply() above - so this isn't a no-op.
        const task = new TaskBuilder().reminderTime('00:30').build();
        const instruction = new SetReminderDateTime(moment('2024-10-02T00:30'));

        expect(instruction.isCheckedForTask(task)).toEqual(false);
    });

    it('should not change identity when applied to a task already matching the target', () => {
        const task = new TaskBuilder().scheduledDate('2024-10-01').reminderTime('14:30').build();
        const instruction = new SetReminderDateTime(moment('2024-10-01T14:30'));

        const [applied] = instruction.apply(task);

        expect(applied).toBe(task);
    });
});

describe('RemoveReminderTime', () => {
    it('should provide a display name', () => {
        expect(new RemoveReminderTime().instructionDisplayName()).toEqual('Remove reminder');
    });

    it('should report checked only for a task with no reminder', () => {
        const instruction = new RemoveReminderTime();
        expect(instruction.isCheckedForTask(taskWithNoReminder)).toEqual(true);
        expect(instruction.isCheckedForTask(taskWithReminder)).toEqual(false);
    });

    it('should remove the reminder time on apply', () => {
        const [applied] = new RemoveReminderTime().apply(taskWithReminder);
        expect(applied.reminderTime).toBeNull();
    });

    it('should not change identity when applied to a task with no reminder already', () => {
        const [applied] = new RemoveReminderTime().apply(taskWithNoReminder);
        expect(applied).toBe(taskWithNoReminder);
    });
});
