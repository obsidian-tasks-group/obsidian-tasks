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
});
