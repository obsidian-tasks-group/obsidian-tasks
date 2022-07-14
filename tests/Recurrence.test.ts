/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Recurrence } from '../src/Recurrence';
import { DateParser } from '../src/Query/DateParser';

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
        const weekly = Recurrence.fromText({
            recurrenceRuleText: 'every week',
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        }) as Recurrence;
        const daily = Recurrence.fromText({
            recurrenceRuleText: 'every day',
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        }) as Recurrence;
        expect(weekly.identicalTo(daily)).toBe(false);
    });

    it('differing only in "when done"', () => {
        const weekly = Recurrence.fromText({
            recurrenceRuleText: 'every week',
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        }) as Recurrence;
        const weeklyWhenDone = Recurrence.fromText({
            recurrenceRuleText: 'every week when done',
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        }) as Recurrence;
        expect(weekly?.identicalTo(weeklyWhenDone)).toBe(false);
    });

    it('differing only in startDate', () => {
        const date1 = DateParser.parseDate('2021-10-21');
        const date2 = DateParser.parseDate('1998-03-13');

        // Two different dates
        const date1Recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every week',
            startDate: date1,
            scheduledDate: null,
            dueDate: null,
        }) as Recurrence;

        const date2Recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every week',
            startDate: date2,
            scheduledDate: null,
            dueDate: null,
        }) as Recurrence;

        const nullRecurrence = Recurrence.fromText({
            recurrenceRuleText: 'every week',
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        }) as Recurrence;

        expect(date1Recurrence?.identicalTo(date1Recurrence)).toBe(true);
        expect(date1Recurrence?.identicalTo(date2Recurrence)).toBe(false);
        expect(date1Recurrence?.identicalTo(nullRecurrence)).toBe(false);
        expect(nullRecurrence?.identicalTo(date1Recurrence)).toBe(false);
    });

    // scheduledDate: Moment | null;
    // dueDate: Moment | null;
});
