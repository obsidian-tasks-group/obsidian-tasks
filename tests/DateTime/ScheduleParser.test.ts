/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { resolveTypedSchedule } from '../../src/DateTime/ScheduleParser';

window.moment = moment;

// A Tuesday, 10:07am - matches this session's own empirical verification of these examples against
// chrono-node, and the user's own worked examples for the unified 'Schedule' field.
const reference = moment('2026-09-15T10:07:00');

describe('resolveTypedSchedule', () => {
    it('should return null for empty/blank input', () => {
        expect(resolveTypedSchedule('', reference, null, true, 0)).toBeNull();
        expect(resolveTypedSchedule('   ', reference, null, true, 0)).toBeNull();
    });

    it('should return null for unparseable input', () => {
        expect(resolveTypedSchedule('wibble', reference, null, true, 0)).toBeNull();
    });

    describe('date-only input - only scheduledDate changes, reminderTime is left for the caller to preserve', () => {
        it.each([
            ['tomorrow', '2026-09-16'],
            ['in a week', '2026-09-22'], // quirk: chrono doesn't mark 'day' certain for week-based durations
            ['27/08', '2027-08-27'],
        ])('"%s" resolves to scheduledDate %s, reminderTime null', (input, expectedDate) => {
            const result = resolveTypedSchedule(input, reference, null, true, 0);
            expect(result).not.toBeNull();
            expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual(expectedDate);
            expect(result!.reminderTime).toBeNull();
        });
    });

    describe('input with an explicit time-of-day - both scheduledDate and reminderTime change', () => {
        it.each([
            ['tomorrow at 4pm', '2026-09-16', '16:00'],
            ['27/08 16:00', '2027-08-27', '16:00'],
            // 2026-09-15T10:07 + 2 days + 19h = 2026-09-18T05:07 (crosses one extra midnight).
            ['in 2 days 19h', '2026-09-18', '05:07'],
        ])('"%s" resolves to scheduledDate %s, reminderTime %s', (input, expectedDate, expectedTime) => {
            const result = resolveTypedSchedule(input, reference, null, true, 0);
            expect(result).not.toBeNull();
            expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual(expectedDate);
            expect(result!.reminderTime).toEqual(expectedTime);
        });
    });

    describe("'noon'/'midnight' quirk workaround - treated as explicit times despite chrono not marking hour/minute certain", () => {
        it('should treat a bare "noon" as an explicit time, not a date', () => {
            const result = resolveTypedSchedule('noon', reference, null, true, 0);
            expect(result).not.toBeNull();
            expect(result!.reminderTime).toEqual('12:00');
            // noon (12:00) is still to come relative to the 10:07 reference, so it stays today.
            expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual('2026-09-15');
        });

        it('should treat a bare "midnight" as an explicit time, not a date, even though chrono marks day/month/year certain for it', () => {
            const result = resolveTypedSchedule('midnight', reference, null, true, 0);
            expect(result).not.toBeNull();
            expect(result!.reminderTime).toEqual('00:00');
            // midnight (00:00) has already passed relative to the 10:07 reference, so it rolls to tomorrow.
            expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual('2026-09-16');
        });

        it('should never move an existing scheduled date for a bare "noon"/"midnight", same as any other bare time', () => {
            const existing = moment('2026-10-01');
            expect(
                resolveTypedSchedule('noon', reference, existing, true, 0)!.scheduledDate.format('YYYY-MM-DD'),
            ).toEqual('2026-10-01');
            expect(
                resolveTypedSchedule('midnight', reference, existing, true, 0)!.scheduledDate.format('YYYY-MM-DD'),
            ).toEqual('2026-10-01');
        });
    });

    describe('bare clock time (no date wording at all) - the confirmed edge case', () => {
        it('should keep an existing scheduled date unchanged, and only update the time', () => {
            const existing = moment('2026-10-01');
            const result = resolveTypedSchedule('16:00', reference, existing, true, 0);
            expect(result).not.toBeNull();
            expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual('2026-10-01');
            expect(result!.reminderTime).toEqual('16:00');
        });

        it('should default to today when there is no existing scheduled date and the time is still to come', () => {
            // reference is 10:07 - 16:00 is still ahead today.
            const result = resolveTypedSchedule('16:00', reference, null, true, 0);
            expect(result).not.toBeNull();
            expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual('2026-09-15');
            expect(result!.reminderTime).toEqual('16:00');
        });

        it('should default to tomorrow when there is no existing scheduled date and the time has already passed today', () => {
            // reference is 10:07 - 09:00 has already gone by today.
            const result = resolveTypedSchedule('09:00', reference, null, true, 0);
            expect(result).not.toBeNull();
            expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual('2026-09-16');
            expect(result!.reminderTime).toEqual('09:00');
        });

        it('should not roll a past bare time forward to tomorrow when forwardDate is false', () => {
            const result = resolveTypedSchedule('09:00', reference, null, false, 0);
            expect(result).not.toBeNull();
            expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual('2026-09-15');
        });
    });

    it('"in 30 minutes" always shifts scheduledDate, regardless of any existing scheduled date', () => {
        const existing = moment('2026-10-01');
        const result = resolveTypedSchedule('in 30 minutes', reference, existing, true, 0);
        expect(result).not.toBeNull();
        expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual('2026-09-15');
        expect(result!.reminderTime).toEqual('10:37');
        expect(result!.isRelative).toEqual(true);
    });

    describe("rounding - only ever applied to a relative offset's time, never an absolute clock time or a date-only phrase", () => {
        it('should round a relative offset up to the given increment', () => {
            const result = resolveTypedSchedule('in 30 minutes', reference, null, true, 30);
            expect(result!.reminderTime).toEqual('11:00');
        });

        it('should leave a relative offset exact when the increment is 0 ("no rounding")', () => {
            const result = resolveTypedSchedule('in 30 minutes', reference, null, true, 0);
            expect(result!.reminderTime).toEqual('10:37');
        });

        it('should never round an absolute clock time', () => {
            const result = resolveTypedSchedule('16:00', reference, null, true, 30);
            expect(result!.reminderTime).toEqual('16:00');
        });

        it('should never round a date-only relative expression, even one landing near midnight', () => {
            const result = resolveTypedSchedule('in a week', reference, null, true, 30);
            expect(result!.reminderTime).toBeNull();
            expect(result!.scheduledDate.format('YYYY-MM-DD')).toEqual('2026-09-22');
        });
    });
});
