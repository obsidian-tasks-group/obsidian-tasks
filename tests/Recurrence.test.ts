/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { Recurrence } from '../src/Recurrence';

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

    // startDate: Moment | null;
    // scheduledDate: Moment | null;
    // dueDate: Moment | null;
});
