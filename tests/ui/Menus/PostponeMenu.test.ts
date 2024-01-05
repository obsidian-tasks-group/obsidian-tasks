/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';

import { PostponeMenu } from '../../../src/ui/Menus/PostponeMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TestableTaskSaver, menuToString } from './MenuTestingHelpers';

window.moment = moment;

export {};

const yesterday = '2023-12-02';
const today = '2023-12-03';
const tomorrow = '2023-12-04';

// const invalidDate = '2023-12-36';

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
    TestableTaskSaver.reset();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('PostponeMenu', () => {
    it('should populate the menu for overdue task', () => {
        // Arrange
        const task = new TaskBuilder().dueDate(yesterday).build();
        const button = document.createElement('button');

        // Act
        const menu = new PostponeMenu(button, task);

        // Assert
        const itemsAsText = menuToString(menu);
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
              Due in 2 days, on Tue 5th Dec
              Due in 3 days, on Wed 6th Dec
              Due in 4 days, on Thu 7th Dec
              Due in 5 days, on Fri 8th Dec
              Due in 6 days, on Sat 9th Dec
              ---
              Due in a week, on Sun 10th Dec
              Due in 2 weeks, on Sun 17th Dec
              Due in 3 weeks, on Sun 24th Dec
              Due in a month, on Wed 3rd Jan"
        `);
    });

    it('should populate the menu for future task', () => {
        // Arrange
        const task = new TaskBuilder().scheduledDate(tomorrow).build();
        const button = document.createElement('button');

        // Act
        const menu = new PostponeMenu(button, task);

        // Assert
        const itemsAsText = menuToString(menu);
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
              Postpone scheduled date by 2 days, to Wed 6th Dec
              Postpone scheduled date by 3 days, to Thu 7th Dec
              Postpone scheduled date by 4 days, to Fri 8th Dec
              Postpone scheduled date by 5 days, to Sat 9th Dec
              Postpone scheduled date by 6 days, to Sun 10th Dec
              ---
              Postpone scheduled date by a week, to Mon 11th Dec
              Postpone scheduled date by 2 weeks, to Mon 18th Dec
              Postpone scheduled date by 3 weeks, to Mon 25th Dec
              Postpone scheduled date by a month, to Thu 4th Jan"
        `);
    });

    it('should modify task, if different date selected', () => {
        // Arrange
        const task = new TaskBuilder().startDate(today).build();
        const button = document.createElement('button');
        const menu = new PostponeMenu(button, task, TestableTaskSaver.testableTaskSaver);

        // Act
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'PostponeMenu'.
        const todoItem = menu.items[0];
        expect(todoItem.title).toEqual('Start in 2 days, on Tue 5th Dec');
        todoItem.callback();

        // Assert
        expect(Object.is(task, TestableTaskSaver.taskBeingOverwritten)).toEqual(true);
        expect(TestableTaskSaver.taskBeingOverwritten!.start.formatAsDate()).toEqual(today);

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].start.formatAsDate()).toEqual('2023-12-05');
    });
});
