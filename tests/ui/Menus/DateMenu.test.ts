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

    it('should populate a menu for a specific field', () => {
        // Arrange
        const task = new TaskBuilder().dueDate(farPast).build();

        // Act
        const field = TaskLayoutComponent.ScheduledDate;
        const menu = new DateMenu(field, task);

        // Assert
        const itemsAsText = menuToString(menu);
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
              Scheduled in 2 days, on Tue 5th Dec
              Scheduled in 3 days, on Wed 6th Dec
              Scheduled in 4 days, on Thu 7th Dec
              Scheduled in 5 days, on Fri 8th Dec
              Scheduled in 6 days, on Sat 9th Dec
              Scheduled in a week, on Sun 10th Dec
              Scheduled in 2 weeks, on Sun 17th Dec
              Scheduled in 3 weeks, on Sun 24th Dec
              Scheduled in a month, on Wed 3rd Jan"
        `);
    });
});
