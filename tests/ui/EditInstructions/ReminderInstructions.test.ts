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

const taskWithNoReminder = new TaskBuilder().dueDate('2024-10-01').build();
const taskWithReminder = new TaskBuilder().dueDate('2024-10-01').reminderTime('09:00').build();

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
});

describe('SetReminderDateTime', () => {
    it('should provide a default display name', () => {
        const instruction = new SetReminderDateTime(moment('2024-10-01T09:00'));
        expect(instruction.instructionDisplayName()).toEqual('Set reminder: 09:00');
    });

    it('should only set the time when the target date matches the existing anchor date', () => {
        const task = new TaskBuilder().dueDate('2024-10-01').build();
        const instruction = new SetReminderDateTime(moment('2024-10-01T14:30'));

        const [applied] = instruction.apply(task);

        expect(applied.reminderTime).toEqual('14:30');
        expect(applied.dueDate!.format('YYYY-MM-DD')).toEqual('2024-10-01');
    });

    it('should shift the anchor date forward when the target date crosses into the next day', () => {
        const task = new TaskBuilder().dueDate('2024-10-01').build();
        const instruction = new SetReminderDateTime(moment('2024-10-02T00:30'));

        const [applied] = instruction.apply(task);

        expect(applied.reminderTime).toEqual('00:30');
        expect(applied.dueDate!.format('YYYY-MM-DD')).toEqual('2024-10-02');
    });

    it('should prefer due, then scheduled, then start, as the anchor to shift', () => {
        const task = new TaskBuilder().scheduledDate('2024-10-01').startDate('2024-09-01').build();
        const instruction = new SetReminderDateTime(moment('2024-10-02T00:30'));

        const [applied] = instruction.apply(task);

        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-02');
        expect(applied.startDate!.format('YYYY-MM-DD')).toEqual('2024-09-01');
    });

    it('should only set the reminder time, and not create an anchor date, if there is none', () => {
        const task = new TaskBuilder().build();
        const instruction = new SetReminderDateTime(moment('2024-10-02T00:30'));

        const [applied] = instruction.apply(task);

        expect(applied.reminderTime).toEqual('00:30');
        expect(applied.dueDate).toBeNull();
        expect(applied.scheduledDate).toBeNull();
        expect(applied.startDate).toBeNull();
    });

    it('should not change identity when applied to a task already matching the target', () => {
        const task = new TaskBuilder().dueDate('2024-10-01').reminderTime('14:30').build();
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
