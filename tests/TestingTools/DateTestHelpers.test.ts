import moment from 'moment';
import { withTimezone } from './DateTestHelpers';

window.moment = moment;

describe('withTimezone', () => {
    it('should run a test under a non-UTC timezone', () => {
        expect(new Date('2026-01-15T12:00:00Z').getTimezoneOffset()).toBe(0);

        withTimezone('America/New_York', () => {
            expect(process.env.TZ).toBe('America/New_York');
            // America/New_York is UTC-5 (300 minutes behind UTC) in winter:
            expect(new Date('2026-01-15T12:00:00Z').getTimezoneOffset()).toBe(300);
            expect(window.moment('2026-01-15T12:00:00Z').format('YYYY-MM-DD HH:mm')).toBe('2026-01-15 07:00');
        });
    });

    it('should restore the default timezone after the test', () => {
        expect(process.env.TZ).toBe('UTC');

        withTimezone('Pacific/Auckland', () => {
            expect(process.env.TZ).toBe('Pacific/Auckland');
        });

        expect(process.env.TZ).toBe('UTC');
        expect(new Date('2026-01-15T12:00:00Z').getTimezoneOffset()).toBe(0);
    });

    it('should restore the previous timezone even if the callback throws or TZ was unset', () => {
        expect(() =>
            withTimezone('Europe/London', () => {
                throw new Error('boom');
            }),
        ).toThrow('boom');
        expect(process.env.TZ).toBe('UTC');

        const originalTZ = process.env.TZ;
        try {
            delete process.env.TZ;
            withTimezone('America/New_York', () => {
                expect(process.env.TZ).toBe('America/New_York');
            });
            expect(process.env.TZ).toBeUndefined();
        } finally {
            process.env.TZ = originalTZ;
        }
    });

    it('should show that 02:30 does not exist on the spring-forward day in America/New_York', () => {
        withTimezone('America/New_York', () => {
            // In America/New_York, DST springs forward at 02:00 -> 03:00 on 2026-03-08,
            // so 02:30 does not exist and is normalized forward to 03:30 EDT (UTC-4):
            const springForward = window.moment('2026-03-08 02:30', 'YYYY-MM-DD HH:mm', true);
            expect(springForward.isValid()).toBe(true);
            expect(springForward.format('YYYY-MM-DD HH:mm')).toBe('2026-03-08 03:30');
            expect(springForward.utcOffset()).toBe(-240);
        });
    });
});
