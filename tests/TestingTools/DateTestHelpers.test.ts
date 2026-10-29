import moment from 'moment';
import { withTimezone } from './DateTestHelpers';

window.moment = moment;

describe('withTimezone', () => {
    it('should run a test under a requested timezone', () => {
        withTimezone('America/New_York', () => {
            expect(process.env.TZ).toBe('America/New_York');
            // America/New_York is UTC-5 (300 minutes behind UTC) in winter:
            expect(window.moment('2026-01-15T12:00:00Z').format('YYYY-MM-DD HH:mm')).toBe('2026-01-15 07:00');
            expect(window.moment('2026-01-15T12:00:00Z').utcOffset()).toBe(-300);
        });

        withTimezone('Pacific/Auckland', () => {
            expect(process.env.TZ).toBe('Pacific/Auckland');
            // Pacific/Auckland is UTC+13 (780 minutes ahead of UTC) in summer:
            expect(window.moment('2026-01-15T12:00:00Z').format('YYYY-MM-DD HH:mm')).toBe('2026-01-16 01:00');
            expect(window.moment('2026-01-15T12:00:00Z').utcOffset()).toBe(780);
        });
    });

    it('should restore the default timezone after the test', () => {
        const defaultTZ = process.env.TZ;
        const targetTZ = defaultTZ === 'Pacific/Auckland' ? 'America/New_York' : 'Pacific/Auckland';

        const timeInDefaultTZ = window.moment('2026-01-15T12:00:00Z').format('YYYY-MM-DD HH:mm');

        withTimezone(targetTZ, () => {
            expect(process.env.TZ).toBe(targetTZ);
            expect(window.moment('2026-01-15T12:00:00Z').format('YYYY-MM-DD HH:mm')).not.toBe(timeInDefaultTZ);
        });

        expect(process.env.TZ).toBe(defaultTZ);
        expect(window.moment('2026-01-15T12:00:00Z').format('YYYY-MM-DD HH:mm')).toBe(timeInDefaultTZ);
    });

    it('should restore the default timezone even if the callback throws', () => {
        const defaultTZ = process.env.TZ;
        const targetTZ = defaultTZ === 'Europe/London' ? 'Pacific/Auckland' : 'Europe/London';

        expect(() =>
            withTimezone(targetTZ, () => {
                expect(process.env.TZ).toBe(targetTZ);
                throw new Error('boom');
            }),
        ).toThrow('boom');

        expect(process.env.TZ).toBe(defaultTZ);
    });

    it('should leave TZ unset afterwards if it was unset beforehand', () => {
        const defaultTZ = process.env.TZ;
        try {
            delete process.env.TZ;
            withTimezone('America/New_York', () => {
                expect(process.env.TZ).toBe('America/New_York');
            });
            expect(process.env.TZ).toBeUndefined();
        } finally {
            if (defaultTZ !== undefined) {
                process.env.TZ = defaultTZ;
            } else {
                delete process.env.TZ;
            }
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

    it('should not accept an asynchronous callback', () => {
        // The timezone is restored as soon as the callback returns, so an async callback would
        // run mostly outside the requested timezone. TypeScript rejects it at compile time:
        // @ts-expect-error async callbacks are not supported
        withTimezone('Europe/London', async () => {
            await Promise.resolve();
        });
    });
});
