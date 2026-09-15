/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import {
    parseReminderTimeInput,
    resolveTypedReminderTime,
    roundToIncrement,
} from '../../src/DateTime/ReminderTimeParser';

window.moment = moment;

const reference = moment('2024-01-15T10:07:00');

describe('parseReminderTimeInput', () => {
    it('should return null for an empty string', () => {
        expect(parseReminderTimeInput('', reference)).toBeNull();
        expect(parseReminderTimeInput('   ', reference)).toBeNull();
    });

    it('should return null for unparseable input', () => {
        expect(parseReminderTimeInput('wibble', reference)).toBeNull();
    });

    it.each([
        ['09:00', '09:00'],
        ['9am', '09:00'],
        ['9:30pm', '21:30'],
        ['14:00', '14:00'],
    ])('should parse absolute time "%s" as %s, not relative', (input, expectedTime) => {
        const result = parseReminderTimeInput(input, reference);
        expect(result).not.toBeNull();
        expect(result!.time).toEqual(expectedTime);
        expect(result!.isRelative).toEqual(false);
        expect(result!.date.isSame(reference, 'day')).toEqual(true);
    });

    it('should parse "in 30 minutes" as a relative offset', () => {
        const result = parseReminderTimeInput('in 30 minutes', reference);
        expect(result).not.toBeNull();
        expect(result!.isRelative).toEqual(true);
        expect(result!.date.format('YYYY-MM-DD HH:mm')).toEqual('2024-01-15 10:37');
    });

    it('should parse "in 2 hours" as a relative offset', () => {
        const result = parseReminderTimeInput('in 2 hours', reference);
        expect(result).not.toBeNull();
        expect(result!.isRelative).toEqual(true);
        expect(result!.date.format('YYYY-MM-DD HH:mm')).toEqual('2024-01-15 12:07');
    });

    it.each(['in 2 h', 'in 2h', 'in 2 hr', 'in 2 hrs'])(
        'should parse the abbreviated duration "%s" as a relative offset too, same as "in 2 hours"',
        (input) => {
            const result = parseReminderTimeInput(input, reference);
            expect(result).not.toBeNull();
            expect(result!.isRelative).toEqual(true);
            expect(result!.date.format('YYYY-MM-DD HH:mm')).toEqual('2024-01-15 12:07');
        },
    );

    it('should detect a relative offset crossing midnight into the next day', () => {
        const lateReference = moment('2024-01-15T23:30:00');
        const result = parseReminderTimeInput('in 2 hours', lateReference);
        expect(result).not.toBeNull();
        expect(result!.date.format('YYYY-MM-DD HH:mm')).toEqual('2024-01-16 01:30');
        expect(result!.date.isSame(lateReference, 'day')).toEqual(false);
    });

    it.each([
        ['in 3 days', '2024-01-18 10:07'],
        ['in 2 weeks', '2024-01-29 10:07'],
        ['in 3 days 12 min', '2024-01-18 10:19'],
        ['in 3 days, 12 minutes', '2024-01-18 10:19'],
        ['in 1 day 2 hours', '2024-01-16 12:07'],
    ])(
        'should parse the compound relative offset "%s" as relative too, shifting the date',
        (input, expectedDateTime) => {
            const result = parseReminderTimeInput(input, reference);
            expect(result).not.toBeNull();
            expect(result!.isRelative).toEqual(true);
            expect(result!.date.format('YYYY-MM-DD HH:mm')).toEqual(expectedDateTime);
        },
    );

    it.each([
        ['in a week', '2024-01-22 10:07'],
        ['an hour', '2024-01-15 11:07'],
        ['a day', '2024-01-16 10:07'],
        ['a month', '2024-02-15 10:07'],
        ['a year', '2025-01-15 10:07'],
    ])(
        'should parse the word-quantified relative offset "%s" as relative too, shifting the date',
        (input, expectedDateTime) => {
            // Chrono treats 'a'/'an' as equivalent to '1' ('a week' == '1 week') - the duration-term regex
            // originally only recognised a numeral quantifier, silently misclassifying these as an absolute
            // clock time instead (and, in EditableTask.ts's modal-save path, silently skipping the anchor
            // date shift - it only shifts the anchor for a relative result).
            const result = parseReminderTimeInput(input, reference);
            expect(result).not.toBeNull();
            expect(result!.isRelative).toEqual(true);
            expect(result!.date.format('YYYY-MM-DD HH:mm')).toEqual(expectedDateTime);
        },
    );

    it.each([
        ['in a week at 5pm', '2024-01-22 17:00'],
        ['in 3 days at 5pm', '2024-01-18 17:00'],
    ])(
        'should parse a relative offset with a trailing clock-time clause "%s", using that time instead of now\'s',
        (input, expectedDateTime) => {
            const result = parseReminderTimeInput(input, reference);
            expect(result).not.toBeNull();
            expect(result!.isRelative).toEqual(true);
            expect(result!.date.format('YYYY-MM-DD HH:mm')).toEqual(expectedDateTime);
        },
    );

    it('should not misclassify a bare clock-time-only "at" phrase as relative', () => {
        const result = parseReminderTimeInput('at 5pm', reference);
        expect(result).not.toBeNull();
        expect(result!.isRelative).toEqual(false);
    });
});

describe('roundToIncrement', () => {
    describe("'ceil' mode - the only behaviour this ever had before rounding mode became configurable", () => {
        it('should round up to the next 30-minute mark', () => {
            expect(roundToIncrement(moment('2024-01-15T14:07:00'), 30, 'ceil').format('HH:mm')).toEqual('14:30');
            expect(roundToIncrement(moment('2024-01-15T14:31:00'), 30, 'ceil').format('HH:mm')).toEqual('15:00');
        });

        it('should round up to the next 15-minute mark', () => {
            expect(roundToIncrement(moment('2024-01-15T14:07:00'), 15, 'ceil').format('HH:mm')).toEqual('14:15');
            expect(roundToIncrement(moment('2024-01-15T14:16:00'), 15, 'ceil').format('HH:mm')).toEqual('14:30');
        });

        it('should carry over into the next hour and day when needed', () => {
            expect(roundToIncrement(moment('2024-01-15T23:45:01'), 30, 'ceil').format('YYYY-MM-DD HH:mm')).toEqual(
                '2024-01-16 00:00',
            );
        });
    });

    describe("'floor' mode", () => {
        it('should round down to the previous 30-minute mark', () => {
            expect(roundToIncrement(moment('2024-01-15T14:07:00'), 30, 'floor').format('HH:mm')).toEqual('14:00');
            expect(roundToIncrement(moment('2024-01-15T14:31:00'), 30, 'floor').format('HH:mm')).toEqual('14:30');
        });

        it('should carry back into the previous hour and day when needed', () => {
            expect(roundToIncrement(moment('2024-01-15T00:05:00'), 30, 'floor').format('YYYY-MM-DD HH:mm')).toEqual(
                '2024-01-15 00:00',
            );
        });
    });

    describe("'round' mode - to the nearer mark, ties rounding forward like 'ceil'", () => {
        it('should round down when closer to the previous mark', () => {
            expect(roundToIncrement(moment('2024-01-15T14:07:00'), 30, 'round').format('HH:mm')).toEqual('14:00');
        });

        it('should round up when closer to the next mark', () => {
            expect(roundToIncrement(moment('2024-01-15T14:23:00'), 30, 'round').format('HH:mm')).toEqual('14:30');
        });

        it('should round forward on an exact tie', () => {
            expect(roundToIncrement(moment('2024-01-15T14:15:00'), 30, 'round').format('HH:mm')).toEqual('14:30');
        });
    });

    it('should leave an already-round time unchanged, regardless of mode', () => {
        for (const mode of ['floor', 'round', 'ceil'] as const) {
            expect(roundToIncrement(moment('2024-01-15T14:30:00'), 30, mode).format('HH:mm')).toEqual('14:30');
        }
    });

    it('should not round at all when incrementMinutes is 0 ("no rounding"), regardless of mode', () => {
        for (const mode of ['floor', 'round', 'ceil'] as const) {
            expect(roundToIncrement(moment('2024-01-15T14:07:23'), 0, mode).format('YYYY-MM-DD HH:mm')).toEqual(
                '2024-01-15 14:07',
            );
        }
    });

    it('should not round at all when incrementMinutes is negative, regardless of mode', () => {
        for (const mode of ['floor', 'round', 'ceil'] as const) {
            expect(roundToIncrement(moment('2024-01-15T14:07:23'), -30, mode).format('YYYY-MM-DD HH:mm')).toEqual(
                '2024-01-15 14:07',
            );
        }
    });
});

describe('resolveTypedReminderTime', () => {
    it('should round a relative offset up to the given increment, unlike parseReminderTimeInput', () => {
        // reference is 10:07, so "in 30 minutes" is 10:37 exactly.
        const result = resolveTypedReminderTime('in 30 minutes', reference, 30, 'ceil');

        expect(result).not.toBeNull();
        expect(result!.isRelative).toEqual(true);
        expect(result!.time).toEqual('11:00');
        expect(result!.date.format('YYYY-MM-DD HH:mm')).toEqual('2024-01-15 11:00');
    });

    it('should leave a relative offset exact when the increment is 0 ("no rounding")', () => {
        const result = resolveTypedReminderTime('in 30 minutes', reference, 0, 'ceil');

        expect(result!.time).toEqual('10:37');
    });

    it('should round an abbreviated relative offset ("in 2 h") the same as its spelled-out form ("in 2 hours")', () => {
        // reference is 10:07, so "in 2 h" is 12:07 exactly, rounded up to 12:30.
        const result = resolveTypedReminderTime('in 2 h', reference, 30, 'ceil');

        expect(result).not.toBeNull();
        expect(result!.isRelative).toEqual(true);
        expect(result!.time).toEqual('12:30');
    });

    it('should respect the rounding mode - "floor" rounds a relative offset down, not up', () => {
        // reference is 10:07, so "in 30 minutes" is 10:37 exactly, floored to 10:30.
        const result = resolveTypedReminderTime('in 30 minutes', reference, 30, 'floor');

        expect(result!.time).toEqual('10:30');
    });

    it('should never round an absolute clock time, regardless of the increment or mode', () => {
        const result = resolveTypedReminderTime('09:00', reference, 30, 'floor');

        expect(result).not.toBeNull();
        expect(result!.isRelative).toEqual(false);
        expect(result!.time).toEqual('09:00');
    });

    it('should return null for unparseable input, same as parseReminderTimeInput', () => {
        expect(resolveTypedReminderTime('wibble', reference, 30, 'ceil')).toBeNull();
    });
});
