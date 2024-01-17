/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import type { unitOfTime } from 'moment/moment';
import { TasksDate } from '../../src/Scripting/TasksDate';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-11 20:00'));
});

afterEach(() => {
    jest.useRealTimers();
});

const overdue = new TasksDate(moment('2023-06-10'));
const today = new TasksDate(moment('2023-06-11'));
const future = new TasksDate(moment('2023-06-12'));
const invalid = new TasksDate(moment('2023-02-31'));
const undated = new TasksDate(null);

describe('TasksDate', () => {
    it('should format valid dates', () => {
        const date = '2023-10-13';
        const tasksDate = new TasksDate(moment(date));
        expect(tasksDate.format('dddd')).toEqual('Friday');
        expect(tasksDate.formatAsDate()).toEqual(date);
        expect(tasksDate.formatAsDateAndTime()).toEqual(date + ' 00:00');
        expect(tasksDate.toISOString()).toEqual('2023-10-13T00:00:00.000Z');
    });

    it('should format null dates as empty string', () => {
        const tasksDate = new TasksDate(null);
        expect(tasksDate.format('dddd')).toEqual('');
        expect(tasksDate.formatAsDate()).toEqual('');
        expect(tasksDate.formatAsDateAndTime()).toEqual('');
        expect(tasksDate.toISOString()).toEqual('');
    });

    it('should format null dates as provided default string', () => {
        const tasksDate = new TasksDate(null);
        const fallBackText = 'no date';
        expect(tasksDate.format('dddd', fallBackText)).toEqual(fallBackText);
        expect(tasksDate.formatAsDate(fallBackText)).toEqual(fallBackText);
        expect(tasksDate.formatAsDateAndTime(fallBackText)).toEqual(fallBackText);
    });

    it('should format invalid dates meaningfully', () => {
        const tasksDate = new TasksDate(moment('2023-12-32'));
        expect(tasksDate.format('dddd')).toEqual('Invalid date');
        expect(tasksDate.formatAsDate()).toEqual('Invalid date');
        expect(tasksDate.formatAsDateAndTime()).toEqual('Invalid date');
        expect(tasksDate.toISOString()).toBeNull();
    });

    it('should categorise dates for grouping, relative to today - with PropertyCategory object', () => {
        expect(invalid.category.groupText).toEqual('%%0%% Invalid date');
        expect(overdue.category.groupText).toEqual('%%1%% Overdue');
        expect(today.category.groupText).toEqual('%%2%% Today');
        expect(future.category.groupText).toEqual('%%3%% Future');
        expect(undated.category.groupText).toEqual('%%4%% Undated');
    });

    // For behaviour, see https://momentjs.com/docs/#/displaying/fromnow/
    it.each([
        ['1899-04-30T18:44:54.240Z', '%%118990611%% 124 years ago'],
        ['2021-01-20T07:04:35.022Z', '%%120210611%% 2 years ago'],
        ['2022-07-25T08:40:50.048Z', '%%120220611%% a year ago'],
        ['2022-07-29T19:07:44.595Z', '%%120220811%% 10 months ago'],
        ['2023-03-29T08:31:15.671Z', '%%120230411%% 2 months ago'],
        ['2023-04-29T08:59:53.331Z', '%%120230511%% a month ago'],
        ['2023-05-17T14:42:26.842Z', '%%120230517%% 25 days ago'],
        ['2023-06-09T17:36:01.176Z', '%%120230609%% 2 days ago'],
        ['2023-06-11T09:42:21.083Z', '%%120230611%% 10 hours ago'],
        ['2023-06-11T19:15:00.000Z', '%%120230611%% an hour ago'],
        ['2023-06-11T19:16:00.000Z', '%%120230611%% 44 minutes ago'],
        ['2023-06-11T19:59:00.000Z', '%%120230611%% a minute ago'],
        ['2023-06-11T20:00:00.000Z', '%%120230611%% a few seconds ago'], // Exact time that clock is set to
        ['2023-06-11T20:01:00.000Z', '%%120230611%% in a minute'],
        ['2023-06-11T20:44:00.000Z', '%%120230611%% in 44 minutes'],
        ['2023-06-11T20:45:00.000Z', '%%120230611%% in an hour'],
        ['2023-06-12T10:56:01.641Z', '%%320230612%% in 15 hours'],
        ['2023-06-12T22:02:39.934Z', '%%320230612%% in a day'],
        ['2023-06-15T13:07:53.700Z', '%%320230615%% in 4 days'],
        ['2023-07-06T07:41:58.379Z', '%%320230705%% in 24 days'],
        ['2023-07-08T02:55:31.854Z', '%%320230711%% in a month'],
        ['2024-04-03T20:06:33.578Z', '%%320240411%% in 10 months'],
        ['2024-05-02T03:53:43.120Z', '%%320240611%% in a year'],
        ['2024-12-14T08:15:40.973Z', '%%320250611%% in 2 years'],
        ['2032-12-25T14:41:16.452Z', '%%320330611%% in 10 years'],
    ])(
        'should categorise dates for grouping, relative to today: on "%s" - expected "%s"',
        (date: string, expectedResult: string) => {
            const tasksDate = new TasksDate(moment(date));
            expect(tasksDate.fromNow.groupText).toEqual(expectedResult);
        },
    );

    it('should categorise edge-case dates for grouping, relative to today', () => {
        expect(new TasksDate(null).fromNow.groupText).toEqual('');
        // Invalid dates always get put first
        expect(new TasksDate(moment('1999-02-31')).fromNow.groupText).toEqual('%%0%% Invalid date');
        expect(new TasksDate(moment('2023-02-31')).fromNow.groupText).toEqual('%%0%% Invalid date');
    });
});

describe('TasksDate - postpone', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-11-28'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    function checkDatePostponesTo(
        initialDate: string,
        amount: number,
        unitOfTime: unitOfTime.DurationConstructor,
        expectedDate: string,
    ) {
        const tasksDate = new TasksDate(moment(initialDate));
        const postponedDate = new TasksDate(tasksDate.postpone(unitOfTime, amount));
        expect(postponedDate.formatAsDate()).toEqual(expectedDate);
    }

    it('should not modify the original date when postponing', () => {
        function checkPostponingDoesNotModifyOriginalDate(
            initialDate: string,
            amount: number,
            unitOfTime: moment.unitOfTime.DurationConstructor,
        ) {
            // Arrange
            const initialTasksDate = new TasksDate(moment(initialDate));

            // Act
            const postponed = new TasksDate(initialTasksDate.postpone(unitOfTime, amount));

            // Assert
            // We don't care what the new date is; we just need to know that the date has been modified
            // or the Assert below would pass spuriously.
            expect(postponed.formatAsDate()).not.toEqual(initialDate);

            expect(initialTasksDate.formatAsDate()).toEqual(initialDate);
        }

        checkPostponingDoesNotModifyOriginalDate('2023-11-27', 1, 'day'); // before today
        checkPostponingDoesNotModifyOriginalDate('2023-11-28', 1, 'day'); // today
        checkPostponingDoesNotModifyOriginalDate('2023-11-30', 1, 'day'); // a future date
    });

    it('should postpone an older date (before yesterday) to tomorrow', () => {
        checkDatePostponesTo('2023-11-20', 1, 'day', '2023-11-29');
    });

    it('should postpone yesterday date to tomorrow', () => {
        checkDatePostponesTo('2023-11-27', 1, 'day', '2023-11-29');

        // TODO: Review this behaviour.
        //       It is not clear that this is the best result - it is just the current result, since #2473.
        checkDatePostponesTo('2023-11-27', 1, 'week', '2023-12-05');
        checkDatePostponesTo('2023-11-27', 1, 'month', '2023-12-28');
    });

    it('should postpone today date to tomorrow', () => {
        checkDatePostponesTo('2023-11-28', 1, 'day', '2023-11-29');
    });

    it('should postpone tomorrow date to after tomorrow', () => {
        checkDatePostponesTo('2023-11-29', 1, 'day', '2023-11-30');
    });

    it('should postpone a future date (after tomorrow)', () => {
        checkDatePostponesTo('2024-03-20', 1, 'day', '2024-03-21');
    });

    it('should postpone by a month, to a shorter month (in a leap year)', () => {
        checkDatePostponesTo('2024-01-31', 1, 'month', '2024-02-29');
    });

    // TODO Add more tests for increments other than 1 day

    describe('visualise postpone behaviour', () => {
        function postponeMultipleDatesBy(amount: number, unitOfTime: unitOfTime.DurationConstructor) {
            // Set a date that is easy to decrement and increment
            const today = '2023-11-10';
            jest.setSystemTime(new Date(today));

            const dates = [
                '2023-11-01',
                '2023-11-02',
                '2023-11-03',
                '2023-11-04',
                '2023-11-05',
                '2023-11-06',
                '2023-11-07',
                '2023-11-08',
                '2023-11-09',
                '2023-11-10',
                '2023-11-11',
                '2023-11-12',
                '2023-11-13',
            ];
            let output = `[initial]     => [postponed on '${today}' by '${amount} ${unitOfTime}']
`;
            dates.forEach((date) => {
                const tasksDate = new TasksDate(moment(date));
                const format = 'YYYY-MM-DD ddd';
                const postponedDate = new TasksDate(tasksDate.postpone(unitOfTime, amount));
                output += `${tasksDate.format(format)} => ${postponedDate.format(format)}\n`;
            });
            return output;
        }

        it('by 1 day', () => {
            const postponedDatesDescription = postponeMultipleDatesBy(1, 'day');
            expect(postponedDatesDescription).toMatchInlineSnapshot(`
                "[initial]     => [postponed on '2023-11-10' by '1 day']
                2023-11-01 Wed => 2023-11-11 Sat
                2023-11-02 Thu => 2023-11-11 Sat
                2023-11-03 Fri => 2023-11-11 Sat
                2023-11-04 Sat => 2023-11-11 Sat
                2023-11-05 Sun => 2023-11-11 Sat
                2023-11-06 Mon => 2023-11-11 Sat
                2023-11-07 Tue => 2023-11-11 Sat
                2023-11-08 Wed => 2023-11-11 Sat
                2023-11-09 Thu => 2023-11-11 Sat
                2023-11-10 Fri => 2023-11-11 Sat
                2023-11-11 Sat => 2023-11-12 Sun
                2023-11-12 Sun => 2023-11-13 Mon
                2023-11-13 Mon => 2023-11-14 Tue
                "
            `);
        });

        it('by 1 week', () => {
            const postponedDatesDescription = postponeMultipleDatesBy(1, 'week');
            expect(postponedDatesDescription).toMatchInlineSnapshot(`
                "[initial]     => [postponed on '2023-11-10' by '1 week']
                2023-11-01 Wed => 2023-11-17 Fri
                2023-11-02 Thu => 2023-11-17 Fri
                2023-11-03 Fri => 2023-11-17 Fri
                2023-11-04 Sat => 2023-11-17 Fri
                2023-11-05 Sun => 2023-11-17 Fri
                2023-11-06 Mon => 2023-11-17 Fri
                2023-11-07 Tue => 2023-11-17 Fri
                2023-11-08 Wed => 2023-11-17 Fri
                2023-11-09 Thu => 2023-11-17 Fri
                2023-11-10 Fri => 2023-11-17 Fri
                2023-11-11 Sat => 2023-11-18 Sat
                2023-11-12 Sun => 2023-11-19 Sun
                2023-11-13 Mon => 2023-11-20 Mon
                "
            `);
        });
    });
});
