/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';

import { ReminderMenu } from '../../../src/ui/Menus/ReminderMenu';
import { resetSettings, updateSettings } from '../../../src/Config/Settings';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TestableTaskSaver, menuToString } from './MenuTestingHelpers';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-12-03T10:07:00'));
    TestableTaskSaver.reset();
});

afterEach(() => {
    jest.useRealTimers();
    resetSettings();
});

describe('ReminderMenu', () => {
    it('should populate the menu with the default presets, relative offsets, and a remove option', () => {
        const task = new TaskBuilder().scheduledDate('2023-12-03').build();

        const menu = new ReminderMenu(task);

        expect(menuToString(menu)).toMatchInlineSnapshot(`
            "
              In 53 minutes (11:00)
              In 83 minutes (11:30)
              In 143 minutes (12:30)
              In 263 minutes (14:30)
              ---
              Set reminder: 09:00
              Set reminder: 12:00
              Set reminder: 15:00
              Set reminder: 18:00
              ---
            x Remove reminder"
        `);
    });

    it('should check the preset matching the task current reminder time', () => {
        const task = new TaskBuilder().scheduledDate('2023-12-03').reminderTime('12:00').build();

        const menu = new ReminderMenu(task);

        const itemsAsText = menuToString(menu);
        expect(itemsAsText).toContain('x Set reminder: 12:00');
        expect(itemsAsText).not.toContain('x Remove reminder');
    });

    it('should not check any preset for a reminder anchored to a due date only (reminders anchor to scheduled date only)', () => {
        // A reminder now only ever anchors to Task.scheduledDate - a task whose reminderTime happens to
        // match a preset, but which has no scheduledDate, is an "orphaned" reminder (see TaskLineRenderer's
        // error-pill rendering), not a checked preset.
        const task = new TaskBuilder().dueDate('2023-12-03').reminderTime('12:00').build();

        const menu = new ReminderMenu(task);

        const itemsAsText = menuToString(menu);
        expect(itemsAsText).not.toContain('x Set reminder: 12:00');
    });

    it('should reflect configured presets, offsets and rounding increment', () => {
        updateSettings({
            reminderPresetTimes: ['07:30', '20:00'],
            reminderRelativeOffsetsMinutes: [15],
            reminderRoundingIncrementMinutes: 15,
        });
        const task = new TaskBuilder().scheduledDate('2023-12-03').build();

        const menu = new ReminderMenu(task);

        expect(menuToString(menu)).toMatchInlineSnapshot(`
            "
              In 23 minutes (10:30)
              ---
              Set reminder: 07:30
              Set reminder: 20:00
              ---
            x Remove reminder"
        `);
    });

    it('should update the task when a preset time is clicked', () => {
        const task = new TaskBuilder().scheduledDate('2023-12-03').build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // relative offsets (4) + separator (1) = index 6 is the second preset ('12:00').
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const setNoonItem = menu.items[6];
        expect(setNoonItem.title).toEqual('Set reminder: 12:00');
        setNoonItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('12:00');
        // A plain preset time never changes the scheduled date that's already present (it would only
        // create one - see SetReminderTime's own tests - if this task had none at all).
        expect(TestableTaskSaver.tasksBeingSaved![0].scheduledDate!.format('YYYY-MM-DD')).toEqual('2023-12-03');
    });

    it("should create today's scheduled date as the anchor when a preset time is clicked on a task with none", () => {
        const task = new TaskBuilder().build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // relative offsets (4) + separator (1) = index 6 is the second preset ('12:00').
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const setNoonItem = menu.items[6];
        expect(setNoonItem.title).toEqual('Set reminder: 12:00');
        setNoonItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('12:00');
        expect(TestableTaskSaver.tasksBeingSaved![0].scheduledDate!.format('YYYY-MM-DD')).toEqual('2023-12-03');
    });

    it("should create today's scheduled date as the anchor even when the task already has a due date (reminders no longer anchor to due/start)", () => {
        const task = new TaskBuilder().dueDate('2023-12-10').build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // relative offsets (4) + separator (1) = index 6 is the second preset ('12:00').
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const setNoonItem = menu.items[6];
        setNoonItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('12:00');
        expect(TestableTaskSaver.tasksBeingSaved![0].scheduledDate!.format('YYYY-MM-DD')).toEqual('2023-12-03');
        // The due date is untouched - it was never the anchor.
        expect(TestableTaskSaver.tasksBeingSaved![0].dueDate!.format('YYYY-MM-DD')).toEqual('2023-12-10');
    });

    it('should shift the scheduled date when a relative offset crosses midnight', () => {
        jest.setSystemTime(new Date('2023-12-03T23:45:00'));
        const task = new TaskBuilder().scheduledDate('2023-12-03').build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // relative offsets come first now - index 0 is 'in 30 minutes'.
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const relativeItem = menu.items[0];
        // 23:45 + 30 minutes = 00:15, rounded up to the next 30-minute mark = 00:30 - 45 minutes away from
        // 23:45, the label's exact-time wording (not the nominal 30 the offset is configured as).
        expect(relativeItem.title).toEqual('In 45 minutes (00:30)');
        relativeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].scheduledDate!.format('YYYY-MM-DD')).toEqual('2023-12-04');
        // Regression check for a bug where the raw, unrounded offset was applied instead of the pre-rounded
        // date the item's own label promises.
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('00:30');
    });

    it('should apply the ROUNDED time from a relative offset, not the raw unrounded offset (regression)', () => {
        // now = 10:07. "In 30 minutes" -> raw 10:37, rounded up to the next 30-minute mark -> 11:00, 53
        // minutes away from 'now' - what the item's own label, "In 53 minutes (11:00)", already promises.
        // A prior bug re-parsed the item's raw value at click-time instead of reusing the pre-rounded date,
        // silently applying the unrounded 10:37 while still showing the rounded time in the menu.
        const task = new TaskBuilder().scheduledDate('2023-12-03').build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // relative offsets come first now - index 0 is 'in 30 minutes'.
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const relativeItem = menu.items[0];
        expect(relativeItem.title).toEqual('In 53 minutes (11:00)');
        relativeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('11:00');
    });

    it('should apply the exact, unrounded relative offset when rounding is disabled ("no rounding")', () => {
        updateSettings({ reminderRoundingIncrementMinutes: 0 });
        const task = new TaskBuilder().scheduledDate('2023-12-03').build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // relative offsets come first now - index 0 is 'in 30 minutes'.
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const relativeItem = menu.items[0];
        expect(relativeItem.title).toEqual('In 30 minutes (10:37)');
        relativeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('10:37');
    });

    it('should respect the "floor" rounding mode, rounding a relative offset down rather than up', () => {
        updateSettings({ reminderRoundingMode: 'floor' });
        const task = new TaskBuilder().scheduledDate('2023-12-03').build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // now = 10:07. "In 30 minutes" -> raw 10:37, floored to the previous 30-minute mark -> 10:30, 23
        // minutes away from 'now'.
        // relative offsets come first now - index 0 is 'in 30 minutes'.
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const relativeItem = menu.items[0];
        expect(relativeItem.title).toEqual('In 23 minutes (10:30)');
        relativeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('10:30');
    });

    it('should remove the reminder when "Remove reminder" is clicked', () => {
        const task = new TaskBuilder().scheduledDate('2023-12-03').reminderTime('09:00').build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const items = menu.items;
        const removeItem = items[items.length - 1];
        expect(removeItem.title).toEqual('Remove reminder');
        removeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toBeNull();
    });
});
