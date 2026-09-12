/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { RemoveReminderTime, SetReminderTime } from '../../../src/ui/EditInstructions/ReminderInstructions';

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
