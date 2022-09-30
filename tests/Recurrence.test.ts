/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Recurrence } from '../src/Recurrence';
import { RecurrenceBuilder } from './TestingTools/RecurrenceBuilder';

jest.mock('obsidian');
window.moment = moment;

describe('Recurrence', () => {
    it('creates a recurring instance even if no date is given', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every week',
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next).toStrictEqual({
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        });
    });

    it('creates a recurrence the next month, even on the 31st', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every month',
            startDate: null,
            scheduledDate: null,
            dueDate: moment('2022-01-31').startOf('day'),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate!.isSame(moment('2022-02-28'))).toStrictEqual(true);
    });

    it('creates a recurrence 3 months in', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 3 months',
            startDate: null,
            scheduledDate: null,
            dueDate: moment('2022-01-31').startOf('day'),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate!.isSame(moment('2022-04-30'))).toStrictEqual(true);
    });

    it('creates a recurrence the next month, even across years', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 2 months',
            startDate: null,
            scheduledDate: null,
            dueDate: moment('2023-12-31').startOf('day'),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate!.isSame(moment('2024-02-29'))).toStrictEqual(true);
    });

    it('creates a recurrence in 2 years, even on Feb 29th', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 2 years',
            startDate: null,
            scheduledDate: null,
            dueDate: moment('2024-02-29').startOf('day'),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate!.isSame(moment('2026-02-28'))).toStrictEqual(true);
    });

    it('creates a recurrence in 11 months, even on March 31', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 11 months',
            startDate: null,
            scheduledDate: null,
            dueDate: moment('2020-03-31').startOf('day'),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate!.isSame(moment('2021-02-28'))).toStrictEqual(true);
    });

    it('creates a recurrence in 13 months, even on Jan 31', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 13 months',
            startDate: null,
            scheduledDate: null,
            dueDate: moment('2020-01-31').startOf('day'),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate!.isSame(moment('2021-02-28'))).toStrictEqual(true);
    });
});

describe('identicalTo', () => {
    it('differing only in rule text', () => {
        const weekly = new RecurrenceBuilder().rule('every week').build();
        const daily = new RecurrenceBuilder().rule('every day').build();
        expect(weekly.identicalTo(daily)).toBe(false);
    });

    it('differing only in "when done"', () => {
        const weekly = new RecurrenceBuilder().rule('every week').build();
        const weeklyWhenDone = new RecurrenceBuilder().rule('every week when done').build();
        expect(weekly?.identicalTo(weeklyWhenDone)).toBe(false);
    });

    it('differing only in startDate', () => {
        // Two different dates
        const date1Recurrence = new RecurrenceBuilder().startDate('2021-10-21').build();

        const date2Recurrence = new RecurrenceBuilder().startDate('1998-03-13').build();

        const nullRecurrence = new RecurrenceBuilder().startDate(null).build();

        expect(date1Recurrence?.identicalTo(date1Recurrence)).toBe(true);
        expect(date1Recurrence?.identicalTo(date2Recurrence)).toBe(false);
        expect(date1Recurrence?.identicalTo(nullRecurrence)).toBe(false);
        expect(nullRecurrence?.identicalTo(date1Recurrence)).toBe(false);
    });

    it('differing only in scheduledDate', () => {
        // Two different dates
        // No need to replicate the null checks in startDate
        const date1Recurrence = new RecurrenceBuilder().scheduledDate('2021-10-21').build();

        const date2Recurrence = new RecurrenceBuilder().scheduledDate('1998-03-13').build();

        expect(date1Recurrence?.identicalTo(date1Recurrence)).toBe(true);
        expect(date1Recurrence?.identicalTo(date2Recurrence)).toBe(false);
    });

    it('differing only in dueDate', () => {
        // Two different dates
        // No need to replicate the null checks in startDate
        const date1Recurrence = new RecurrenceBuilder().dueDate('2021-10-21').build();

        const date2Recurrence = new RecurrenceBuilder().dueDate('1998-03-13').build();

        expect(date1Recurrence?.identicalTo(date1Recurrence)).toBe(true);
        expect(date1Recurrence?.identicalTo(date2Recurrence)).toBe(false);
    });
});
