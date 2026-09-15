/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { RemoveScheduledDateAndReminder, SetSchedule } from '../../../src/ui/EditInstructions/ScheduleInstructions';

window.moment = moment;

describe('SetSchedule', () => {
    it('should set both scheduledDate and reminderTime', () => {
        const task = new TaskBuilder().build();
        const instruction = new SetSchedule(moment('2024-10-01'), '09:00');

        const [applied] = instruction.apply(task);

        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-01');
        expect(applied.reminderTime).toEqual('09:00');
    });

    it('should set scheduledDate alone, clearing reminderTime, when reminderTime is null', () => {
        const task = new TaskBuilder().scheduledDate('2024-09-01').reminderTime('09:00').build();
        const instruction = new SetSchedule(moment('2024-10-01'), null);

        const [applied] = instruction.apply(task);

        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-01');
        expect(applied.reminderTime).toBeNull();
    });

    it('should clear scheduledDate, keeping reminderTime, when scheduledDate is null', () => {
        const task = new TaskBuilder().scheduledDate('2024-09-01').reminderTime('09:00').build();
        const instruction = new SetSchedule(null, '09:00');

        const [applied] = instruction.apply(task);

        expect(applied.scheduledDate).toBeNull();
        expect(applied.reminderTime).toEqual('09:00');
    });

    it('should provide a default display name', () => {
        expect(new SetSchedule(moment('2024-10-01'), '09:00').instructionDisplayName()).toEqual('Set schedule');
    });

    it('should allow a custom display name', () => {
        expect(new SetSchedule(moment('2024-10-01'), '09:00', 'Custom').instructionDisplayName()).toEqual('Custom');
    });

    it('should not change identity when applied to a task already matching', () => {
        const task = new TaskBuilder().scheduledDate('2024-10-01').reminderTime('09:00').build();
        const instruction = new SetSchedule(moment('2024-10-01'), '09:00');

        const [applied] = instruction.apply(task);

        expect(applied).toBe(task);
    });

    it('should report checked only when both fields match', () => {
        const task = new TaskBuilder().scheduledDate('2024-10-01').reminderTime('09:00').build();
        expect(new SetSchedule(moment('2024-10-01'), '09:00').isCheckedForTask(task)).toEqual(true);
        expect(new SetSchedule(moment('2024-10-02'), '09:00').isCheckedForTask(task)).toEqual(false);
        expect(new SetSchedule(moment('2024-10-01'), '10:00').isCheckedForTask(task)).toEqual(false);
        expect(new SetSchedule(null, null).isCheckedForTask(new TaskBuilder().build())).toEqual(true);
    });
});

describe('RemoveScheduledDateAndReminder', () => {
    it('should remove both scheduledDate and reminderTime', () => {
        const task = new TaskBuilder().scheduledDate('2024-10-01').reminderTime('09:00').build();
        const [applied] = new RemoveScheduledDateAndReminder(task).apply(task);

        expect(applied.scheduledDate).toBeNull();
        expect(applied.reminderTime).toBeNull();
    });

    it('should not change identity when scheduledDate is already null', () => {
        const task = new TaskBuilder().build();
        const [applied] = new RemoveScheduledDateAndReminder(task).apply(task);

        expect(applied).toBe(task);
    });

    it('should leave the reminder alone when the scheduled date is inferred (RemoveTaskDate refuses to clear it)', () => {
        const task = new TaskBuilder()
            .scheduledDate('2024-10-01')
            .scheduledDateIsInferred(true)
            .reminderTime('09:00')
            .build();

        const [applied] = new RemoveScheduledDateAndReminder(task).apply(task);

        expect(applied).toBe(task);
        expect(applied.scheduledDate!.format('YYYY-MM-DD')).toEqual('2024-10-01');
        expect(applied.reminderTime).toEqual('09:00');
    });

    it('should report checked only when both fields are null', () => {
        const withBoth = new TaskBuilder().scheduledDate('2024-10-01').reminderTime('09:00').build();
        const withNeither = new TaskBuilder().build();

        expect(new RemoveScheduledDateAndReminder(withBoth).isCheckedForTask(withBoth)).toEqual(false);
        expect(new RemoveScheduledDateAndReminder(withNeither).isCheckedForTask(withNeither)).toEqual(true);
    });

    it('should provide a display name', () => {
        const task = new TaskBuilder().scheduledDate('2024-10-01').build();
        expect(new RemoveScheduledDateAndReminder(task).instructionDisplayName()).toEqual('Remove scheduled date');
    });
});
