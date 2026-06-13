import { Duration } from '../../src/Task/Duration';

describe('Duration.fromText', () => {
    it('parses hours-only format', () => {
        const d = Duration.fromText('2h');
        expect(d).not.toBeNull();
        expect(d!.hours).toBe(2);
        expect(d!.minutes).toBe(0);
    });

    it('parses minutes-only format', () => {
        const d = Duration.fromText('45m');
        expect(d).not.toBeNull();
        expect(d!.hours).toBe(0);
        expect(d!.minutes).toBe(45);
    });

    it('parses hours-and-minutes format', () => {
        const d = Duration.fromText('1h30m');
        expect(d).not.toBeNull();
        expect(d!.hours).toBe(1);
        expect(d!.minutes).toBe(30);
    });

    it('parses hours-and-minutes without trailing m', () => {
        const d = Duration.fromText('1h30');
        expect(d).not.toBeNull();
        expect(d!.hours).toBe(1);
        expect(d!.minutes).toBe(30);
    });

    it('normalizes excess minutes into hours', () => {
        const d = Duration.fromText('90m');
        expect(d).not.toBeNull();
        expect(d!.hours).toBe(1);
        expect(d!.minutes).toBe(30);
    });

    it('normalizes 60m into 1h', () => {
        const d = Duration.fromText('60m');
        expect(d).not.toBeNull();
        expect(d!.hours).toBe(1);
        expect(d!.minutes).toBe(0);
    });

    it('normalizes combined hours and excess minutes', () => {
        const d = Duration.fromText('1h90m');
        expect(d).not.toBeNull();
        expect(d!.hours).toBe(2);
        expect(d!.minutes).toBe(30);
    });

    it('returns null for zero duration', () => {
        expect(Duration.fromText('0h')).toBeNull();
        expect(Duration.fromText('0m')).toBeNull();
        expect(Duration.fromText('0h0m')).toBeNull();
    });

    it('returns null for invalid text', () => {
        expect(Duration.fromText('')).toBeNull();
        expect(Duration.fromText('abc')).toBeNull();
        expect(Duration.fromText('1.5h')).toBeNull();
        expect(Duration.fromText('30')).toBeNull();
    });

    it('is case-insensitive', () => {
        expect(Duration.fromText('1H30M')).not.toBeNull();
        expect(Duration.fromText('2H')).not.toBeNull();
        expect(Duration.fromText('45M')).not.toBeNull();
    });
});

describe('Duration.toText', () => {
    it('returns empty string for None', () => {
        expect(Duration.None.toText()).toBe('');
    });

    it('renders hours only', () => {
        expect(Duration.fromText('2h')!.toText()).toBe('2h');
    });

    it('renders minutes only', () => {
        expect(Duration.fromText('45m')!.toText()).toBe('45m');
    });

    it('renders hours and minutes', () => {
        expect(Duration.fromText('1h30m')!.toText()).toBe('1h30m');
    });

    it('normalizes and renders consistently: 90m equals 1h30m', () => {
        expect(Duration.fromText('90m')!.toText()).toBe('1h30m');
        expect(Duration.fromText('1h30m')!.toText()).toBe('1h30m');
    });
});

describe('Duration.totalMinutes', () => {
    it('returns total minutes', () => {
        expect(Duration.fromText('1h30m')!.totalMinutes).toBe(90);
        expect(Duration.fromText('2h')!.totalMinutes).toBe(120);
        expect(Duration.fromText('45m')!.totalMinutes).toBe(45);
    });

    it('returns 0 for None', () => {
        expect(Duration.None.totalMinutes).toBe(0);
    });
});

describe('Duration.fromTotalMinutes', () => {
    it('creates duration from total minutes', () => {
        const d = Duration.fromTotalMinutes(90);
        expect(d).not.toBeNull();
        expect(d!.hours).toBe(1);
        expect(d!.minutes).toBe(30);
    });

    it('returns null for zero minutes', () => {
        expect(Duration.fromTotalMinutes(0)).toBeNull();
    });

    it('returns null for negative minutes', () => {
        expect(Duration.fromTotalMinutes(-5)).toBeNull();
    });
});

describe('Duration.None', () => {
    it('has zero hours and minutes', () => {
        expect(Duration.None.hours).toBe(0);
        expect(Duration.None.minutes).toBe(0);
    });

    it('toText returns empty string', () => {
        expect(Duration.None.toText()).toBe('');
    });
});
