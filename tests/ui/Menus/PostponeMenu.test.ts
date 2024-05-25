/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';

import { PostponeMenu } from '../../../src/ui/Menus/PostponeMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TestableTaskSaver, menuToString } from './MenuTestingHelpers';

window.moment = moment;

export {};

const farPast = '2022-01-17';
const yesterday = '2023-12-02';
const today = '2023-12-03';
const tomorrow = '2023-12-04';
const farFuture = '2017-03-25';

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
    function contentsOfPostponeMenuForTask(builderWithDate: TaskBuilder) {
        const task = builderWithDate.build();
        const button = document.createElement('a');

        const menu = new PostponeMenu(button, task);
        return menuToString(menu);
    }

    it('should populate the menu for task scheduled long ao', () => {
        const itemsAsText = contentsOfPostponeMenuForTask(new TaskBuilder().scheduledDate(farPast));
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
              Scheduled today, on Sun 3rd Dec
              Scheduled tomorrow, on Mon 4th Dec
              ---
              Scheduled in 2 days, on Tue 5th Dec
              Scheduled in 3 days, on Wed 6th Dec
              Scheduled in 4 days, on Thu 7th Dec
              Scheduled in 5 days, on Fri 8th Dec
              Scheduled in 6 days, on Sat 9th Dec
              ---
              Scheduled in a week, on Sun 10th Dec
              Scheduled in 2 weeks, on Sun 17th Dec
              Scheduled in 3 weeks, on Sun 24th Dec
              Scheduled in a month, on Wed 3rd Jan
              ---
              Remove scheduled date"
        `);
    });

    it('should populate the menu for task due yesterday', () => {
        const itemsAsText = contentsOfPostponeMenuForTask(new TaskBuilder().dueDate(yesterday));
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
              Due today, on Sun 3rd Dec
              Due tomorrow, on Mon 4th Dec
              ---
              Due in 2 days, on Tue 5th Dec
              Due in 3 days, on Wed 6th Dec
              Due in 4 days, on Thu 7th Dec
              Due in 5 days, on Fri 8th Dec
              Due in 6 days, on Sat 9th Dec
              ---
              Due in a week, on Sun 10th Dec
              Due in 2 weeks, on Sun 17th Dec
              Due in 3 weeks, on Sun 24th Dec
              Due in a month, on Wed 3rd Jan
              ---
              Remove due date"
        `);
    });

    it('should populate the menu for task starting today', () => {
        // Arrange
        const itemsAsText = contentsOfPostponeMenuForTask(new TaskBuilder().startDate(today));
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
              Start today, on Sun 3rd Dec
              Start tomorrow, on Mon 4th Dec
              ---
              Start in 2 days, on Tue 5th Dec
              Start in 3 days, on Wed 6th Dec
              Start in 4 days, on Thu 7th Dec
              Start in 5 days, on Fri 8th Dec
              Start in 6 days, on Sat 9th Dec
              ---
              Start in a week, on Sun 10th Dec
              Start in 2 weeks, on Sun 17th Dec
              Start in 3 weeks, on Sun 24th Dec
              Start in a month, on Wed 3rd Jan
              ---
              Remove start date"
        `);
    });

    it('should populate the menu for task scheduled tomorrow, with inferred scheduled date', () => {
        // Arrange
        const itemsAsText = contentsOfPostponeMenuForTask(
            new TaskBuilder().scheduledDate(tomorrow).scheduledDateIsInferred(true),
        );
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
              Scheduled today, on Sun 3rd Dec
              Scheduled tomorrow, on Mon 4th Dec
              ---
              Postpone scheduled date by 2 days, to Wed 6th Dec
              Postpone scheduled date by 3 days, to Thu 7th Dec
              Postpone scheduled date by 4 days, to Fri 8th Dec
              Postpone scheduled date by 5 days, to Sat 9th Dec
              Postpone scheduled date by 6 days, to Sun 10th Dec
              ---
              Postpone scheduled date by a week, to Mon 11th Dec
              Postpone scheduled date by 2 weeks, to Mon 18th Dec
              Postpone scheduled date by 3 weeks, to Mon 25th Dec
              Postpone scheduled date by a month, to Thu 4th Jan
              ---
              Cannot remove inferred scheduled date"
        `);
    });
    it('should populate the menu for task due far ahead', () => {
        // Arrange
        const itemsAsText = contentsOfPostponeMenuForTask(new TaskBuilder().dueDate(farFuture));
        // TODO Show the year, if it is not the current year.
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
              Due today, on Sun 3rd Dec
              Due tomorrow, on Mon 4th Dec
              ---
              Due in 2 days, on Tue 5th Dec
              Due in 3 days, on Wed 6th Dec
              Due in 4 days, on Thu 7th Dec
              Due in 5 days, on Fri 8th Dec
              Due in 6 days, on Sat 9th Dec
              ---
              Due in a week, on Sun 10th Dec
              Due in 2 weeks, on Sun 17th Dec
              Due in 3 weeks, on Sun 24th Dec
              Due in a month, on Wed 3rd Jan
              ---
              Remove due date"
        `);
    });

    it('should modify task, if different date selected', () => {
        // Arrange
        const task = new TaskBuilder().startDate(today).build();
        const button = document.createElement('a');
        const menu = new PostponeMenu(button, task, TestableTaskSaver.testableTaskSaver);

        // Act
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'PostponeMenu'.
        // item 0 is today.
        // item 1 is tomorrow.
        // item 2 is '---' separator.
        const todoItem = menu.items[3];
        expect(todoItem.title).toEqual('Start in 2 days, on Tue 5th Dec');
        todoItem.callback();

        // Assert
        expect(Object.is(task, TestableTaskSaver.taskBeingOverwritten)).toEqual(true);
        expect(TestableTaskSaver.taskBeingOverwritten!.start.formatAsDate()).toEqual(today);

        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].start.formatAsDate()).toEqual('2023-12-05');
    });
});
