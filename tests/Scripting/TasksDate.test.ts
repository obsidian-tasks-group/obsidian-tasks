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

    it('should categorise dates for grouping, relative to today - with Category object', () => {
        expect(overdue.category.groupText).toEqual('%%1%% Overdue');
        expect(today.category.groupText).toEqual('%%2%% Today');
        expect(future.category.groupText).toEqual('%%3%% Future');
        expect(undated.category.groupText).toEqual('%%4%% Undated');
    });

    it.each([
        ['2013-04-30T18:44:54.240Z', '%%1%% %%20130611%% 10 years ago'],
        ['2013-12-04T13:53:20.188Z', '%%1%% %%20130611%% 10 years ago'],
        ['2014-01-14T13:47:48.839Z', '%%1%% %%20140611%% 9 years ago'],
        ['2014-09-30T02:19:47.232Z', '%%1%% %%20140611%% 9 years ago'],
        ['2014-12-24T01:30:03.300Z', '%%1%% %%20150611%% 8 years ago'],
        ['2015-12-03T14:07:41.796Z', '%%1%% %%20150611%% 8 years ago'],
        ['2016-01-21T23:15:52.945Z', '%%1%% %%20160611%% 7 years ago'],
        ['2016-07-28T02:04:15.810Z', '%%1%% %%20160611%% 7 years ago'],
        ['2017-02-11T14:15:15.666Z', '%%1%% %%20170611%% 6 years ago'],
        ['2017-08-13T17:17:17.121Z', '%%1%% %%20170611%% 6 years ago'],
        ['2018-03-22T14:07:58.638Z', '%%1%% %%20180611%% 5 years ago'],
        ['2018-09-09T19:18:39.610Z', '%%1%% %%20180611%% 5 years ago'],
        ['2018-12-29T15:54:36.359Z', '%%1%% %%20190611%% 4 years ago'],
        ['2019-12-10T08:38:24.611Z', '%%1%% %%20190611%% 4 years ago'],
        ['2020-02-01T07:52:32.487Z', '%%1%% %%20200611%% 3 years ago'],
        ['2020-04-02T10:04:58.570Z', '%%1%% %%20200611%% 3 years ago'],
        ['2021-01-20T07:04:35.022Z', '%%1%% %%20210611%% 2 years ago'],
        ['2021-09-15T19:01:19.333Z', '%%1%% %%20210611%% 2 years ago'],
        ['2022-01-18T08:20:13.564Z', '%%1%% %%20220611%% a year ago'],
        ['2022-06-19T16:17:39.418Z', '%%1%% %%20220611%% a year ago'],
        ['2022-07-25T08:40:50.048Z', '%%1%% %%20220611%% a year ago'],
        ['2022-07-29T19:07:44.595Z', '%%1%% %%20220811%% 10 months ago'],
        ['2022-08-26T09:26:06.328Z', '%%1%% %%20220811%% 10 months ago'],
        ['2022-08-29T10:36:22.696Z', '%%1%% %%20220911%% 9 months ago'],
        ['2022-08-29T21:01:48.946Z', '%%1%% %%20220911%% 9 months ago'],
        ['2022-11-21T10:45:04.391Z', '%%1%% %%20221111%% 7 months ago'],
        ['2022-12-03T16:27:16.889Z', '%%1%% %%20221211%% 6 months ago'],
        ['2023-01-02T02:20:37.438Z', '%%1%% %%20230111%% 5 months ago'],
        ['2023-01-23T06:13:32.753Z', '%%1%% %%20230111%% 5 months ago'],
        ['2023-02-01T19:52:25.816Z', '%%1%% %%20230211%% 4 months ago'],
        ['2023-02-18T18:25:58.574Z', '%%1%% %%20230211%% 4 months ago'],
        ['2023-03-02T15:44:51.935Z', '%%1%% %%20230311%% 3 months ago'],
        ['2023-03-03T14:07:11.673Z', '%%1%% %%20230311%% 3 months ago'],
        ['2023-03-29T08:31:15.671Z', '%%1%% %%20230411%% 2 months ago'],
        ['2023-04-25T13:47:24.928Z', '%%1%% %%20230411%% 2 months ago'],
        ['2023-04-29T08:59:53.331Z', '%%1%% %%20230511%% a month ago'],
        ['2023-05-17T04:48:01.296Z', '%%1%% %%20230511%% a month ago'],
        ['2023-05-17T14:42:26.842Z', '%%1%% %%20230517%% 25 days ago'],
        ['2023-05-18T14:59:13.996Z', '%%1%% %%20230518%% 24 days ago'],
        ['2023-05-20T00:24:53.565Z', '%%1%% %%20230519%% 23 days ago'],
        ['2023-05-20T15:31:01.343Z', '%%1%% %%20230520%% 22 days ago'],
        ['2023-05-21T22:46:00.226Z', '%%1%% %%20230521%% 21 days ago'],
        ['2023-05-23T02:58:19.086Z', '%%1%% %%20230522%% 20 days ago'],
        ['2023-05-24T08:27:19.899Z', '%%1%% %%20230524%% 18 days ago'],
        ['2023-05-25T11:27:40.612Z', '%%1%% %%20230525%% 17 days ago'],
        ['2023-05-26T10:19:03.497Z', '%%1%% %%20230526%% 16 days ago'],
        ['2023-05-28T02:36:50.973Z', '%%1%% %%20230527%% 15 days ago'],
        ['2023-05-28T12:20:05.901Z', '%%1%% %%20230528%% 14 days ago'],
        ['2023-05-29T16:38:41.693Z', '%%1%% %%20230529%% 13 days ago'],
        ['2023-05-30T12:55:57.585Z', '%%1%% %%20230530%% 12 days ago'],
        ['2023-05-31T16:46:38.859Z', '%%1%% %%20230531%% 11 days ago'],
        ['2023-06-01T08:13:03.901Z', '%%1%% %%20230601%% 10 days ago'],
        ['2023-06-02T11:26:10.224Z', '%%1%% %%20230602%% 9 days ago'],
        ['2023-06-03T17:40:08.061Z', '%%1%% %%20230603%% 8 days ago'],
        ['2023-06-04T22:12:08.140Z', '%%1%% %%20230604%% 7 days ago'],
        ['2023-06-05T12:34:59.164Z', '%%1%% %%20230605%% 6 days ago'],
        ['2023-06-06T20:27:59.714Z', '%%1%% %%20230606%% 5 days ago'],
        ['2023-06-07T01:29:57.797Z', '%%1%% %%20230606%% 5 days ago'],
        ['2023-06-08T00:26:27.555Z', '%%1%% %%20230607%% 4 days ago'],
        ['2023-06-08T13:10:33.465Z', '%%1%% %%20230608%% 3 days ago'],
        ['2023-06-09T17:36:01.176Z', '%%1%% %%20230609%% 2 days ago'],
        ['2023-06-11T09:42:21.083Z', '%%1%% %%20230611%% 10 hours ago'],
        ['2023-06-11T20:00:00.000Z', '%%1%% %%20230611%% a few seconds ago'], // Exact time that clock is set to
        ['2023-06-11T23:12:31.762Z', '%%1%% %%20230611%% in 3 hours'],
        ['2023-06-12T07:14:39.489Z', '%%3%% %%20230612%% in 11 hours'],
        ['2023-06-12T10:56:01.641Z', '%%3%% %%20230612%% in 15 hours'],
        ['2023-06-12T22:02:39.934Z', '%%3%% %%20230612%% in a day'],
        ['2023-06-13T18:41:06.451Z', '%%3%% %%20230613%% in 2 days'],
        ['2023-06-14T23:45:12.595Z', '%%3%% %%20230614%% in 3 days'],
        ['2023-06-15T04:59:53.842Z', '%%3%% %%20230614%% in 3 days'],
        ['2023-06-15T13:07:53.700Z', '%%3%% %%20230615%% in 4 days'],
        ['2023-06-15T14:07:03.447Z', '%%3%% %%20230615%% in 4 days'],
        ['2023-06-16T19:07:33.736Z', '%%3%% %%20230616%% in 5 days'],
        ['2023-06-17T17:36:19.414Z', '%%3%% %%20230617%% in 6 days'],
        ['2023-06-18T10:08:15.996Z', '%%3%% %%20230618%% in 7 days'],
        ['2023-06-19T16:06:55.610Z', '%%3%% %%20230619%% in 8 days'],
        ['2023-06-21T00:53:45.829Z', '%%3%% %%20230620%% in 9 days'],
        ['2023-06-21T19:29:41.288Z', '%%3%% %%20230621%% in 10 days'],
        ['2023-06-23T00:17:07.228Z', '%%3%% %%20230622%% in 11 days'],
        ['2023-06-23T13:11:21.372Z', '%%3%% %%20230623%% in 12 days'],
        ['2023-06-25T07:50:46.206Z', '%%3%% %%20230624%% in 13 days'],
        ['2023-06-26T02:15:18.768Z', '%%3%% %%20230625%% in 14 days'],
        ['2023-06-27T16:48:12.728Z', '%%3%% %%20230627%% in 16 days'],
        ['2023-06-29T01:25:56.259Z', '%%3%% %%20230628%% in 17 days'],
        ['2023-06-29T19:17:02.930Z', '%%3%% %%20230629%% in 18 days'],
        ['2023-06-30T16:46:09.457Z', '%%3%% %%20230630%% in 19 days'],
        ['2023-07-01T19:54:52.971Z', '%%3%% %%20230701%% in 20 days'],
        ['2023-07-03T01:01:35.758Z', '%%3%% %%20230702%% in 21 days'],
        ['2023-07-03T10:52:16.873Z', '%%3%% %%20230703%% in 22 days'],
        ['2023-07-04T11:28:54.116Z', '%%3%% %%20230704%% in 23 days'],
        ['2023-07-05T01:27:27.527Z', '%%3%% %%20230704%% in 23 days'],
        ['2023-07-06T07:41:58.379Z', '%%3%% %%20230705%% in 24 days'],
        ['2023-07-08T02:55:31.854Z', '%%3%% %%20230711%% in a month'],
        ['2023-07-26T00:34:58.959Z', '%%3%% %%20230711%% in a month'],
        ['2023-08-05T14:42:49.540Z', '%%3%% %%20230811%% in 2 months'],
        ['2023-08-22T11:03:13.956Z', '%%3%% %%20230811%% in 2 months'],
        ['2023-08-27T23:11:56.190Z', '%%3%% %%20230911%% in 3 months'],
        ['2023-09-26T04:17:06.233Z', '%%3%% %%20230911%% in 3 months'],
        ['2023-09-29T18:39:09.051Z', '%%3%% %%20231011%% in 4 months'],
        ['2023-10-27T00:35:03.072Z', '%%3%% %%20231011%% in 4 months'],
        ['2023-10-27T18:11:26.071Z', '%%3%% %%20231111%% in 5 months'],
        ['2023-11-09T23:07:35.252Z', '%%3%% %%20231111%% in 5 months'],
        ['2023-11-27T22:29:17.599Z', '%%3%% %%20231211%% in 6 months'],
        ['2023-12-26T20:29:23.181Z', '%%3%% %%20231211%% in 6 months'],
        ['2023-12-28T03:05:40.051Z', '%%3%% %%20240111%% in 7 months'],
        ['2024-01-25T17:38:31.355Z', '%%3%% %%20240111%% in 7 months'],
        ['2024-01-27T10:14:33.187Z', '%%3%% %%20240211%% in 8 months'],
        ['2024-02-15T02:31:08.386Z', '%%3%% %%20240211%% in 8 months'],
        ['2024-03-02T19:36:22.477Z', '%%3%% %%20240311%% in 9 months'],
        ['2024-03-25T15:58:06.398Z', '%%3%% %%20240311%% in 9 months'],
        ['2024-04-03T20:06:33.578Z', '%%3%% %%20240411%% in 10 months'],
        ['2024-05-02T03:53:43.120Z', '%%3%% %%20240611%% in a year'],
        ['2024-11-29T17:43:41.326Z', '%%3%% %%20240611%% in a year'],
        ['2024-12-14T08:15:40.973Z', '%%3%% %%20250611%% in 2 years'],
        ['2025-12-09T01:16:21.997Z', '%%3%% %%20250611%% in 2 years'],
        ['2025-12-12T16:09:30.651Z', '%%3%% %%20260611%% in 3 years'],
        ['2026-12-04T04:47:26.784Z', '%%3%% %%20260611%% in 3 years'],
        ['2027-01-15T16:41:07.826Z', '%%3%% %%20270611%% in 4 years'],
        ['2027-08-15T01:05:44.953Z', '%%3%% %%20270611%% in 4 years'],
        ['2028-02-15T03:52:32.930Z', '%%3%% %%20280611%% in 5 years'],
        ['2028-02-25T17:30:15.270Z', '%%3%% %%20280611%% in 5 years'],
        ['2029-11-17T17:20:20.621Z', '%%3%% %%20290611%% in 6 years'],
        ['2031-02-10T06:09:21.185Z', '%%3%% %%20310611%% in 8 years'],
        ['2031-10-18T02:41:19.686Z', '%%3%% %%20310611%% in 8 years'],
        ['2032-04-04T19:26:18.640Z', '%%3%% %%20320611%% in 9 years'],
        ['2032-09-28T03:24:04.592Z', '%%3%% %%20320611%% in 9 years'],
        ['2032-12-25T14:41:16.452Z', '%%3%% %%20330611%% in 10 years'],
        ['2033-11-21T18:29:24.808Z', '%%3%% %%20330611%% in 10 years'],
        ['2033-12-28T01:07:47.202Z', '%%3%% %%20340611%% in 11 years'],
    ])(
        'should categorise dates for grouping, relative to today: on "%s" - expected "%s"',
        (date: string, expectedResult: string) => {
            const tasksDate = new TasksDate(moment(date));
            expect(tasksDate.fromNow).toEqual(expectedResult);
        },
    );

    it('should categorise edge-case dates for grouping, relative to today', () => {
        expect(new TasksDate(null).fromNow).toEqual('');
        // Invalid dates always get sorted next to current date
        expect(new TasksDate(moment('1999-02-31')).fromNow).toEqual('%%3%% %%20230611%% Invalid date');
        expect(new TasksDate(moment('2023-02-31')).fromNow).toEqual('%%3%% %%20230611%% Invalid date');
    });
});
