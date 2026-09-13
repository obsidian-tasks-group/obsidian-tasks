/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';

import { ReminderMenu } from '../../../src/ui/Menus/ReminderMenu';
import { resetSettings, updateSettings } from '../../../src/Config/Settings';
import { mockApp } from '../../__mocks__/obsidian';
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
        const task = new TaskBuilder().dueDate('2023-12-03').build();

        const menu = new ReminderMenu(mockApp, task);

        expect(menuToString(menu)).toMatchInlineSnapshot(`
            "
              Set reminder: 09:00
              Set reminder: 12:00
              Set reminder: 15:00
              Set reminder: 18:00
              ---
              In 30 minutes (~11:00)
              In 1 hour (~11:30)
              In 2 hours (~12:30)
              In 4 hours (~14:30)
              ---
              Custom time…
            x Remove reminder"
        `);
    });

    it('should check the preset matching the task current reminder time', () => {
        const task = new TaskBuilder().dueDate('2023-12-03').reminderTime('12:00').build();

        const menu = new ReminderMenu(mockApp, task);

        const itemsAsText = menuToString(menu);
        expect(itemsAsText).toContain('x Set reminder: 12:00');
        expect(itemsAsText).not.toContain('x Remove reminder');
    });

    it('should reflect configured presets, offsets and rounding increment', () => {
        updateSettings({
            reminderPresetTimes: ['07:30', '20:00'],
            reminderRelativeOffsetsMinutes: [15],
            reminderRoundingIncrementMinutes: 15,
        });
        const task = new TaskBuilder().dueDate('2023-12-03').build();

        const menu = new ReminderMenu(mockApp, task);

        expect(menuToString(menu)).toMatchInlineSnapshot(`
            "
              Set reminder: 07:30
              Set reminder: 20:00
              ---
              In 15 minutes (~10:30)
              ---
              Custom time…
            x Remove reminder"
        `);
    });

    it('should update the task when a preset time is clicked', () => {
        const task = new TaskBuilder().dueDate('2023-12-03').build();
        const menu = new ReminderMenu(mockApp, task, TestableTaskSaver.testableTaskSaver);

        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const setNoonItem = menu.items[1];
        expect(setNoonItem.title).toEqual('Set reminder: 12:00');
        setNoonItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('12:00');
        // A plain preset time never touches the anchor date.
        expect(TestableTaskSaver.tasksBeingSaved![0].dueDate!.format('YYYY-MM-DD')).toEqual('2023-12-03');
    });

    it('should shift the anchor date when a relative offset crosses midnight', () => {
        jest.setSystemTime(new Date('2023-12-03T23:45:00'));
        const task = new TaskBuilder().dueDate('2023-12-03').build();
        const menu = new ReminderMenu(mockApp, task, TestableTaskSaver.testableTaskSaver);

        // presets (4) + separator (1) = index 5 is the first relative item ('in 30 minutes').
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const relativeItem = menu.items[5];
        expect(relativeItem.title).toContain('In 30 minutes');
        relativeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].dueDate!.format('YYYY-MM-DD')).toEqual('2023-12-04');
        // 23:45 + 30 minutes = 00:15, rounded up to the next 30-minute mark = 00:30 (the "In 30 minutes"
        // item's own label). Regression check for a bug where the raw, unrounded offset was applied instead.
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('00:30');
    });

    it('should apply the ROUNDED time from a relative offset, not the raw unrounded offset (regression)', () => {
        // now = 10:07. "In 30 minutes" -> raw 10:37, rounded up to the next 30-minute mark -> 11:00 (as
        // the item's own label, "In 30 minutes (~11:00)", already promises - the '~' flags it as rounded).
        // A prior bug re-parsed the item's raw value at click-time instead of reusing the pre-rounded date,
        // silently applying the unrounded 10:37 while still showing "~11:00" in the menu.
        const task = new TaskBuilder().dueDate('2023-12-03').build();
        const menu = new ReminderMenu(mockApp, task, TestableTaskSaver.testableTaskSaver);

        // presets (4) + separator (1) = index 5 is the first relative item ('in 30 minutes').
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const relativeItem = menu.items[5];
        expect(relativeItem.title).toEqual('In 30 minutes (~11:00)');
        relativeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('11:00');
    });

    it('should apply the exact, unrounded relative offset when rounding is disabled ("no rounding")', () => {
        updateSettings({ reminderRoundingIncrementMinutes: 0 });
        const task = new TaskBuilder().dueDate('2023-12-03').build();
        const menu = new ReminderMenu(mockApp, task, TestableTaskSaver.testableTaskSaver);

        // presets (4) + separator (1) = index 5 is the first relative item ('in 30 minutes').
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const relativeItem = menu.items[5];
        expect(relativeItem.title).toEqual('In 30 minutes (10:37)');
        relativeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('10:37');
    });

    it('should remove the reminder when "Remove reminder" is clicked', () => {
        const task = new TaskBuilder().dueDate('2023-12-03').reminderTime('09:00').build();
        const menu = new ReminderMenu(mockApp, task, TestableTaskSaver.testableTaskSaver);

        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const items = menu.items;
        const removeItem = items[items.length - 1];
        expect(removeItem.title).toEqual('Remove reminder');
        removeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toBeNull();
    });
});
