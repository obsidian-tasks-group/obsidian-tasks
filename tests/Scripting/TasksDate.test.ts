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

    it('should categorise dates with a name, relative to today', () => {
        expect(overdue.category).toEqual('Overdue');
        expect(today.category).toEqual('Today');
        expect(future.category).toEqual('Future');
        expect(undated.category).toEqual('Undated');
    });

    it('should categorise dates with a number, relative to today', () => {
        expect(overdue.categoryNumber).toEqual(1);
        expect(today.categoryNumber).toEqual(2);
        expect(future.categoryNumber).toEqual(3);
        expect(undated.categoryNumber).toEqual(4);
    });

    it('should categorise dates for grouping, relative to today', () => {
        expect(overdue.categoryGroupText).toEqual('%%1%% Overdue');
        expect(today.categoryGroupText).toEqual('%%2%% Today');
        expect(future.categoryGroupText).toEqual('%%3%% Future');
        expect(undated.categoryGroupText).toEqual('%%4%% Undated');
    });
});
