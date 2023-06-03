/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { DateRange } from '../../src/Query/DateRange';

window.moment = moment;

function testDateRange(dateRange: DateRange, start: string, end: string) {
    expect(dateRange.start).toBeDefined();
    expect(dateRange.end).toBeDefined();
    expect(dateRange.isValid()).toEqual(true);
    expect(dateRange.start.format('YYYY-MM-DD HH:mm')).toStrictEqual(`${start} 00:00`);
    expect(dateRange.end.format('YYYY-MM-DD HH:mm')).toStrictEqual(`${end} 00:00`);
}

describe('DateRange - absolute date ranges', () => {
    it('should build date range', () => {
        const dateRange = new DateRange(moment('2023-09-28'), moment('2023-10-01'));
        testDateRange(dateRange, '2023-09-28', '2023-10-01');
    });

    it('should return date range even if dates are reversed', () => {
        const dateRange = new DateRange(moment('2023-08-02'), moment('2017-11-02'));
        testDateRange(dateRange, '2017-11-02', '2023-08-02');
    });
});

describe('DateRange - relative date ranges', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2021, 9, 6)); // 2021-10-06
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it.each([
        ['week', '2021-10-04', '2021-10-10'],
        ['month', '2021-10-01', '2021-10-31'],
        ['quarter', '2021-10-01', '2021-12-31'],
        ['year', '2021-01-01', '2021-12-31'],
    ])('should build relative date range ("%s")', (range, start, end) => {
        const dateRange = DateRange.buildRelative(range as moment.unitOfTime.StartOf);
        testDateRange(dateRange, start, end);
    });
});

describe('Date Parser - correct delta for next & last month & quarter (Today is 2021-04-03)', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2021, 4 - 1, 3)); // 2021-04-03
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should have correct date range after going to next or previous range', () => {
        // The purpose of this test to make adding and subtracting ranges intelligent
        // Subtracting weeks is simple, because their length is always 7 day
        const lastWeek = DateRange.buildRelative('week');
        lastWeek.moveToPrevious('week');
        testDateRange(lastWeek, '2021-03-22', '2021-03-28');

        const nextWeek = DateRange.buildRelative('week');
        nextWeek.moveToNext('week');
        testDateRange(nextWeek, '2021-04-05', '2021-04-11');

        // Months' lengths in days differ (28/30/31)
        const lastMonth = DateRange.buildRelative('month');
        lastMonth.moveToPrevious('month');
        testDateRange(lastMonth, '2021-03-01', '2021-03-31');

        const nextMonth = DateRange.buildRelative('month');
        nextMonth.moveToNext('month');
        testDateRange(nextMonth, '2021-05-01', '2021-05-31');

        // Q1 and Q2 && Q3 and Q4 lengths differ because of the months
        const lastQuarter = DateRange.buildRelative('quarter');
        lastQuarter.moveToPrevious('quarter');
        testDateRange(lastQuarter, '2021-01-01', '2021-03-31');

        // Q2 and Q3 have same length in days
        const nextQuarter = DateRange.buildRelative('quarter');
        nextQuarter.moveToNext('quarter');
        testDateRange(nextQuarter, '2021-07-01', '2021-09-30');

        // Leap year - 366 days, lengths differ
        // Leap year happens every 4 years
        const lastYear = DateRange.buildRelative('year');
        lastYear.moveToPrevious('year');
        testDateRange(lastYear, '2020-01-01', '2020-12-31');

        // Normal year - 365 days
        const nextYear = DateRange.buildRelative('year');
        nextYear.moveToNext('year');
        testDateRange(nextYear, '2022-01-01', '2022-12-31');
    });
});

describe('DateRange - range validity', () => {
    it('should build a valid date range', () => {
        const dateRange = new DateRange(moment('0000-01-01'), moment('2023-12-31'));
        expect(dateRange.start).toBeDefined();
        expect(dateRange.end).toBeDefined();
        expect(dateRange.start.isValid()).toEqual(true);
        expect(dateRange.end.isValid()).toEqual(true);
        expect(dateRange.isValid()).toEqual(true);
    });

    it('should build an invalid range', () => {
        // Both moments are invalid
        const dateRange = DateRange.buildInvalid();
        expect(dateRange.start).toBeDefined();
        expect(dateRange.end).toBeDefined();
        expect(dateRange.start.isValid()).toEqual(false);
        expect(dateRange.end.isValid()).toEqual(false);
        expect(dateRange.isValid()).toEqual(false);
    });
    it('should detect an invalid range', () => {
        // At least one the dates is invalid
        const dateRange1 = new DateRange(moment(), moment());
        dateRange1.start = moment.invalid();
        expect(dateRange1.start).toBeDefined();
        expect(dateRange1.end).toBeDefined();
        expect(dateRange1.start.isValid()).toEqual(false);
        expect(dateRange1.end.isValid()).toEqual(true);
        expect(dateRange1.isValid()).toEqual(false);

        const dateRange2 = new DateRange(moment(), moment());
        dateRange2.end = moment.invalid();
        expect(dateRange2.start).toBeDefined();
        expect(dateRange2.end).toBeDefined();
        expect(dateRange2.start.isValid()).toEqual(true);
        expect(dateRange2.end.isValid()).toEqual(false);
        expect(dateRange2.isValid()).toEqual(false);
    });
});
