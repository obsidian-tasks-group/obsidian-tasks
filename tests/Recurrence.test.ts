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
});

describe('Recurrence equality', () => {
    it('differing only in rule text', () => {
        const weekly = new RecurrenceBuilder().rule('every week').build();
        const daily = new RecurrenceBuilder().rule('every day').build();
        expect(weekly.identicalTo(daily)).toBe(false);
    });

    it('differing only in "when done"', () => {
        const weekly = new RecurrenceBuilder().rule('every week').build();
        const weeklyWhenDone = new RecurrenceBuilder()
            .rule('every week when done')
            .build();
        expect(weekly?.identicalTo(weeklyWhenDone)).toBe(false);
    });

    it('differing only in startDate', () => {
        // Two different dates
        const date1Recurrence = new RecurrenceBuilder()
            .rule('every week')
            .startDate('2021-10-21')
            .build();

        const date2Recurrence = new RecurrenceBuilder()
            .rule('every week')
            .startDate('1998-03-13')
            .build();

        const nullRecurrence = new RecurrenceBuilder()
            .rule('every week')
            .startDate(null)
            .build();

        expect(date1Recurrence?.identicalTo(date1Recurrence)).toBe(true);
        expect(date1Recurrence?.identicalTo(date2Recurrence)).toBe(false);
        expect(date1Recurrence?.identicalTo(nullRecurrence)).toBe(false);
        expect(nullRecurrence?.identicalTo(date1Recurrence)).toBe(false);
    });

    // scheduledDate: Moment | null;
    // dueDate: Moment | null;
});
