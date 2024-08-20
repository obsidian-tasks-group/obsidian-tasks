/**
 * @jest-environment jsdom
 */

import moment from 'moment/moment';

import { DateMenu } from '../../../src/ui/Menus/DateMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TaskLayoutComponent } from '../../../src/Layout/TaskLayoutOptions';
import { TestableTaskSaver, menuToString } from './MenuTestingHelpers';

window.moment = moment;

const farPast = '2022-01-17';
const today = '2023-12-03';

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
    TestableTaskSaver.reset();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('DateMenu', () => {
    beforeEach(() => {
        TestableTaskSaver.reset();
    });

    it('should populate a menu for a Due date', () => {
        // Arrange
        const task = new TaskBuilder().dueDate(farPast).build();

        // Act
        const field = TaskLayoutComponent.ScheduledDate;
        const menu = new DateMenu(field, task);

        // Assert
        const itemsAsText = menuToString(menu);
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
              Scheduled in a month, on Wed 3rd Jan"
        `);
    });

    it('should populate a menu for a Cancelled date', () => {
        // Arrange
        const task = new TaskBuilder().cancelledDate(today).build();

        // Act
        const field = TaskLayoutComponent.CancelledDate;
        const menu = new DateMenu(field, task);

        // Assert
        const itemsAsText = menuToString(menu);
        // TODO Improve wording to 'Cancelled 2 days ago'
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
            x Cancelled today, on Sun 3rd Dec
              Cancelled yesterday, on Sat 2nd Dec
              ---
              Cancelled in -2 days, on Fri 1st Dec
              Cancelled in -3 days, on Thu 30th Nov
              Cancelled in -4 days, on Wed 29th Nov
              Cancelled in -5 days, on Tue 28th Nov
              Cancelled in -6 days, on Mon 27th Nov
              ---
              Cancelled in -1 week, on Sun 26th Nov
              Cancelled in -2 weeks, on Sun 19th Nov
              Cancelled in -3 weeks, on Sun 12th Nov
              Cancelled in -1 month, on Fri 3rd Nov"
        `);
    });
});
