import moment from 'moment';
import { Occurrence } from '../../src/Task/Occurrence';
import { Recurrence } from '../../src/Task/Recurrence';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import { withTimezone } from '../TestingTools/DateTestHelpers';
import { updateSettings } from '../../src/Config/Settings';

window.moment = moment;

describe('Recurrence', () => {
    it('creates a recurring instance even if no date is given', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every week',
            occurrence: new Occurrence({}),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        const nullOccurrence = new Occurrence({ startDate: null, scheduledDate: null, dueDate: null });
        expect(next).toStrictEqual(nullOccurrence);
    });

    it('creates a recurrence the next month, even on the 31st', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every month',
            occurrence: new Occurrence({
                dueDate: moment('2022-01-31').startOf('day'),
            }),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate).toEqualMoment(moment('2022-02-28'));
    });

    it('creates a recurrence 3 months in', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 3 months',
            occurrence: new Occurrence({
                dueDate: moment('2022-01-31').startOf('day'),
            }),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate).toEqualMoment(moment('2022-04-30'));
    });

    it('creates a recurrence the next month, even across years', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 2 months',
            occurrence: new Occurrence({
                dueDate: moment('2023-12-31').startOf('day'),
            }),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate).toEqualMoment(moment('2024-02-29'));
    });

    it('creates a recurrence in 2 years, even on Feb 29th', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 2 years',
            occurrence: new Occurrence({
                dueDate: moment('2024-02-29').startOf('day'),
            }),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate).toEqualMoment(moment('2026-02-28'));
    });

    it('creates a recurrence in 11 months, even on March 31', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 11 months',
            occurrence: new Occurrence({
                dueDate: moment('2020-03-31').startOf('day'),
            }),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate).toEqualMoment(moment('2021-02-28'));
    });

    it('creates a recurrence in 13 months, even on Jan 31', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every 13 months',
            occurrence: new Occurrence({
                dueDate: moment('2020-01-31').startOf('day'),
            }),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate).toEqualMoment(moment('2021-02-28'));
    });

    it('preserves time and format on recurring dates and does not shift relative dates when reference time is after noon', () => {
        const recurrence = new RecurrenceBuilder()
            .rule('every week')
            .startDate('2024-10-01')
            .scheduledDate('2024-10-01T09:30')
            .dueDate('2024-10-02 14:00')
            .build();

        const next = recurrence!.next();

        expect(next!.startDate?.format('YYYY-MM-DD')).toEqual('2024-10-08');
        expect(next!.startDate?.creationData().format).toBeUndefined();
        expect(next!.scheduledDate?.format('YYYY-MM-DDTHH:mm')).toEqual('2024-10-08T09:30');
        expect(next!.scheduledDate?.creationData().format).toEqual('YYYY-MM-DDTHH:mm');
        expect(next!.dueDate?.format('YYYY-MM-DD HH:mm')).toEqual('2024-10-09 14:00');
        expect(next!.dueDate?.creationData().format).toEqual('YYYY-MM-DD HH:mm');
    });
});

// Test cases where a task has a non-existent due, scheduled or start date.
// Tests for invalid dates in the recurrence rules should go in a different section.
describe('Recurrence - with invalid dates in tasks', () => {
    it('does not create a recurrence if highest priority date is invalid', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every day',
            occurrence: new Occurrence({
                dueDate: moment('2022-02-30').startOf('day'), // 30th February: invalid date
            }),
        });

        // Assert

        // Because the highest priority (reference) date in the task (due), was invalid,
        // it cannot construct the Recurrence instance.
        //
        // What this means in practice for users is that if they had an invalid
        // reference date on a recurring task, when the task is completed,
        // there will be no new instance, and the recurrence rule will be lost.
        expect(recurrence).toBeNull(); // Cannot calculated next date
    });

    it('creates a recurrence if a lower priority date is invalid', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every day',
            occurrence: new Occurrence({
                scheduledDate: moment('2022-02-30').startOf('day'), // 30th February: invalid date
                dueDate: moment('2022-02-27').startOf('day'),
            }),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toBeNull();
        // The original scheduled date was an illegal/invalid date.
        // So it is simply given the new value of the same date as the reference date,
        // which here is the due date.
        expect(next!.scheduledDate).toEqualMoment(moment('2022-02-28')); // date was invalid, so is given the value of highest priority supplied date
        expect(next!.dueDate).toEqualMoment(moment('2022-02-28'));
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

    it('differing only in time presence at midnight or separator format', () => {
        const dateOnly = new RecurrenceBuilder().dueDate('2021-10-21').build();
        const midnightSpace = new RecurrenceBuilder().dueDate('2021-10-21 00:00').build();
        const midnightIso = new RecurrenceBuilder().dueDate('2021-10-21T00:00').build();

        expect(dateOnly.identicalTo(midnightSpace)).toBe(false);
        expect(midnightSpace.identicalTo(midnightIso)).toBe(false);
        expect(midnightIso.identicalTo(new RecurrenceBuilder().dueDate('2021-10-21T00:00').build())).toBe(true);
    });
});

describe('Recurrence - with removeScheduledDateOnRecurrence', () => {
    beforeEach(() => {
        updateSettings({ removeScheduledDateOnRecurrence: true });
    });

    afterEach(() => {
        updateSettings({ removeScheduledDateOnRecurrence: false });
    });

    it('should remove the scheduledDate when removeScheduledDate is true', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every month',
            occurrence: new Occurrence({
                startDate: moment('2022-01-01').startOf('day'),
                scheduledDate: moment('2022-01-04').startOf('day'),
                dueDate: moment('2022-01-10').startOf('day'),
            }),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.startDate).toEqualMoment(moment('2022-02-01'));
        expect(next!.scheduledDate).toBeNull();
        expect(next!.dueDate).toEqualMoment(moment('2022-02-10'));
    });

    it('should not remove the scheduledDate when it is the only date', () => {
        // Arrange
        const recurrence = Recurrence.fromText({
            recurrenceRuleText: 'every month',
            occurrence: new Occurrence({
                scheduledDate: moment('2022-01-04').startOf('day'),
            }),
        });

        // Act
        const next = recurrence!.next();

        // Assert
        expect(next!.scheduledDate).not.toBeNull();
    });

    describe('dropScheduledDate and when done', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2022-01-10'));
        });
        afterEach(() => {
            vi.useRealTimers();
        });

        it('calculates correct start date with "dropScheduledDate" and "when done", with no due date', () => {
            // Arrange

            // The task is being completed on the 10th of January.
            // And the user has turned on the setting to remove the scheduled date in the new instance.
            // This means that the user will apply a scheduled date at some point in the future,
            // when they are ready to work on the task.
            // Therefore, in the new task, as there is no Due date, the only date the user will see
            // is the Start date.
            // And so it makes sense to calculate the new 'happens' date using the Start date,
            // not the old scheduled date.
            const recurrence = Recurrence.fromText({
                recurrenceRuleText: 'every 3 days when done',
                occurrence: new Occurrence({
                    startDate: moment('2022-01-01').startOf('day'),
                    scheduledDate: moment('2022-01-04').startOf('day'),
                }),
            });

            // Act
            const next = recurrence!.next();

            // Assert
            expect(next!.startDate).toEqualMoment(moment('2022-01-13'));
            expect(next!.scheduledDate).toBeNull();
        });
    });
});

describe('Recurrence - daylight saving time transitions (America/New_York)', () => {
    it('should preserve wall-clock time across DST spring-forward when time exists on both days', () => {
        withTimezone('America/New_York', () => {
            // 2026-03-08 is US spring-forward day (02:00 jumps to 03:00 in America/New_York).
            const recurrence = Recurrence.fromText({
                recurrenceRuleText: 'every day',
                occurrence: new Occurrence({
                    dueDate: moment('2026-03-07 09:00', 'YYYY-MM-DD HH:mm', true),
                }),
            })!;

            const firstNext = recurrence.next()!;
            expect(firstNext.dueDate!.format('YYYY-MM-DD HH:mm')).toBe('2026-03-08 09:00');

            const secondRecurrence = Recurrence.fromText({
                recurrenceRuleText: 'every day',
                occurrence: firstNext,
            })!;
            const secondNext = secondRecurrence.next()!;
            expect(secondNext.dueDate!.format('YYYY-MM-DD HH:mm')).toBe('2026-03-09 09:00');
        });
    });

    it('shifts a nonexistent DST spring-forward time (02:30 -> 03:30) and subsequent occurrences inherit 03:30', () => {
        withTimezone('America/New_York', () => {
            // On 2026-03-08 in America/New_York, 02:30 does not exist (clocks jump from 01:59 to 03:00).
            const recurrence = Recurrence.fromText({
                recurrenceRuleText: 'every day',
                occurrence: new Occurrence({
                    dueDate: moment('2026-03-07 02:30', 'YYYY-MM-DD HH:mm', true),
                }),
            })!;

            const firstNext = recurrence.next()!;
            expect(firstNext.dueDate!.format('YYYY-MM-DD HH:mm')).toBe('2026-03-08 03:30');

            const secondRecurrence = Recurrence.fromText({
                recurrenceRuleText: 'every day',
                occurrence: firstNext,
            })!;
            const secondNext = secondRecurrence.next()!;
            expect(secondNext.dueDate!.format('YYYY-MM-DD HH:mm')).toBe('2026-03-09 03:30');
        });
    });

    it('should preserve wall-clock time across DST autumn fall-back even inside the repeated hour (01:30)', () => {
        withTimezone('America/New_York', () => {
            // On 2026-11-01 in America/New_York, 01:00-01:59 occurs twice (clocks fall back from 02:00 EDT to 01:00 EST).
            const recurrence = Recurrence.fromText({
                recurrenceRuleText: 'every day',
                occurrence: new Occurrence({
                    dueDate: moment('2026-10-31 01:30', 'YYYY-MM-DD HH:mm', true),
                }),
            })!;

            const firstNext = recurrence.next()!;
            expect(firstNext.dueDate!.format('YYYY-MM-DD HH:mm')).toBe('2026-11-01 01:30');

            const secondRecurrence = Recurrence.fromText({
                recurrenceRuleText: 'every day',
                occurrence: firstNext,
            })!;
            const secondNext = secondRecurrence.next()!;
            expect(secondNext.dueDate!.format('YYYY-MM-DD HH:mm')).toBe('2026-11-02 01:30');
        });
    });
});
