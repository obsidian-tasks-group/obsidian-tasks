/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { parseReminderTimeInput, roundUpToIncrement } from '../../src/DateTime/ReminderTimeParser';

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
});
