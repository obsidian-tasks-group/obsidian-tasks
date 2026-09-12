/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';

import { ReminderMenu } from '../../../src/ui/Menus/ReminderMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TestableTaskSaver, menuToString } from './MenuTestingHelpers';

window.moment = moment;

beforeEach(() => {
    TestableTaskSaver.reset();
});

describe('ReminderMenu', () => {
    it('should populate the menu with preset times and a remove option, for a task with no reminder', () => {
        const task = new TaskBuilder().dueDate('2023-12-03').build();

        const menu = new ReminderMenu(task);

        expect(menuToString(menu)).toMatchInlineSnapshot(`
            "
              Set reminder: 09:00
              Set reminder: 12:00
              Set reminder: 15:00
              Set reminder: 18:00
              ---
            x Remove reminder"
        `);
    });

    it('should check the preset matching the task current reminder time', () => {
        const task = new TaskBuilder().dueDate('2023-12-03').reminderTime('12:00').build();

        const menu = new ReminderMenu(task);

        expect(menuToString(menu)).toMatchInlineSnapshot(`
            "
              Set reminder: 09:00
            x Set reminder: 12:00
              Set reminder: 15:00
              Set reminder: 18:00
              ---
              Remove reminder"
        `);
    });

    it('should update the task when a preset time is clicked', () => {
        const task = new TaskBuilder().dueDate('2023-12-03').build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const setNoonItem = menu.items[1];
        expect(setNoonItem.title).toEqual('Set reminder: 12:00');
        setNoonItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toEqual('12:00');
    });

    it('should remove the reminder when "Remove reminder" is clicked', () => {
        const task = new TaskBuilder().dueDate('2023-12-03').reminderTime('09:00').build();
        const menu = new ReminderMenu(task, TestableTaskSaver.testableTaskSaver);

        // @ts-expect-error TS2339: Property 'items' does not exist on type 'ReminderMenu'.
        const removeItem = menu.items[5];
        expect(removeItem.title).toEqual('Remove reminder');
        removeItem.callback();

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].reminderTime).toBeNull();
    });
});
