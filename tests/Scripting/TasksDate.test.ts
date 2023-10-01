/**
 * @jest-environment jsdom
 */

import moment from 'moment';

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
        // Invalid dates always get sorted next to current date
        expect(new TasksDate(moment('1999-02-31')).fromNow.groupText).toEqual('%%320230611%% Invalid date');
        expect(new TasksDate(moment('2023-02-31')).fromNow.groupText).toEqual('%%320230611%% Invalid date');
    });
});
