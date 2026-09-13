/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import {
    parseReminderTimeInput,
    resolveTypedReminderTime,
    roundUpToIncrement,
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
});

describe('roundUpToIncrement', () => {
    it('should round up to the next 30-minute mark', () => {
        expect(roundUpToIncrement(moment('2024-01-15T14:07:00'), 30).format('HH:mm')).toEqual('14:30');
        expect(roundUpToIncrement(moment('2024-01-15T14:31:00'), 30).format('HH:mm')).toEqual('15:00');
    });

    it('should leave an already-round time unchanged', () => {
        expect(roundUpToIncrement(moment('2024-01-15T14:30:00'), 30).format('HH:mm')).toEqual('14:30');
    });

    it('should round up to the next 15-minute mark', () => {
        expect(roundUpToIncrement(moment('2024-01-15T14:07:00'), 15).format('HH:mm')).toEqual('14:15');
        expect(roundUpToIncrement(moment('2024-01-15T14:16:00'), 15).format('HH:mm')).toEqual('14:30');
    });

    it('should carry over into the next hour and day when needed', () => {
        expect(roundUpToIncrement(moment('2024-01-15T23:45:01'), 30).format('YYYY-MM-DD HH:mm')).toEqual(
            '2024-01-16 00:00',
        );
    });

    it('should not round at all when incrementMinutes is 0 ("no rounding")', () => {
        expect(roundUpToIncrement(moment('2024-01-15T14:07:23'), 0).format('YYYY-MM-DD HH:mm')).toEqual(
            '2024-01-15 14:07',
        );
    });

    it('should not round at all when incrementMinutes is negative', () => {
        expect(roundUpToIncrement(moment('2024-01-15T14:07:23'), -30).format('YYYY-MM-DD HH:mm')).toEqual(
            '2024-01-15 14:07',
        );
    });
});

describe('resolveTypedReminderTime', () => {
    it('should round a relative offset up to the given increment, unlike parseReminderTimeInput', () => {
        // reference is 10:07, so "in 30 minutes" is 10:37 exactly.
        const result = resolveTypedReminderTime('in 30 minutes', reference, 30);

        expect(result).not.toBeNull();
        expect(result!.isRelative).toEqual(true);
        expect(result!.time).toEqual('11:00');
        expect(result!.date.format('YYYY-MM-DD HH:mm')).toEqual('2024-01-15 11:00');
    });

    it('should leave a relative offset exact when the increment is 0 ("no rounding")', () => {
        const result = resolveTypedReminderTime('in 30 minutes', reference, 0);

        expect(result!.time).toEqual('10:37');
    });

    it('should round an abbreviated relative offset ("in 2 h") the same as its spelled-out form ("in 2 hours")', () => {
        // reference is 10:07, so "in 2 h" is 12:07 exactly, rounded up to 12:30.
        const result = resolveTypedReminderTime('in 2 h', reference, 30);

        expect(result).not.toBeNull();
        expect(result!.isRelative).toEqual(true);
        expect(result!.time).toEqual('12:30');
    });

    it('should never round an absolute clock time, regardless of the increment', () => {
        const result = resolveTypedReminderTime('09:00', reference, 30);

        expect(result).not.toBeNull();
        expect(result!.isRelative).toEqual(false);
        expect(result!.time).toEqual('09:00');
    });

    it('should return null for unparseable input, same as parseReminderTimeInput', () => {
        expect(resolveTypedReminderTime('wibble', reference, 30)).toBeNull();
    });
});
