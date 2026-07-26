/**
 * Represents an estimated duration for a task, in hours and minutes.
 *
 * Durations are normalized on creation: excess minutes are carried into hours.
 * For example, `Duration.fromText('90m')` produces `{ hours: 1, minutes: 30 }`,
 * the same as `Duration.fromText('1h30m')`.
 *
 * @see Duration.None for a sentinel value representing "no duration".
 */
export class Duration {
    readonly hours: number;
    readonly minutes: number;

    private constructor({ hours, minutes }: { hours: number; minutes: number }) {
        this.hours = hours;
        this.minutes = minutes;
    }

    /** Sentinel value representing "no duration set". */
    public static readonly None: Duration = new Duration({ hours: 0, minutes: 0 });

    /** Regex string matching valid duration values like '1h30m', '2h', '45m'. */
    public static readonly valueRegEx: string = '[0-9]+h[0-9]+m?|[0-9]+h|[0-9]+m';

    /**
     * Parse a duration from a text string such as '1h30m', '2h', or '45m'.
     *
     * Values are normalized so that excess minutes are carried into hours.
     * For example, '90m' is stored as 1 hour 30 minutes.
     *
     * Returns null if the text does not match a valid duration format, or if the
     * duration would be zero.
     */
    public static fromText(durationText: string): Duration | null {
        const hoursAndMinutesMatch = durationText.match(/^(\d+)h(\d+)m?$/i);
        if (hoursAndMinutesMatch) {
            const hours = parseInt(hoursAndMinutesMatch[1], 10);
            const minutes = parseInt(hoursAndMinutesMatch[2], 10);
            return Duration.fromTotalMinutes(hours * 60 + minutes);
        }

        const hoursOnlyMatch = durationText.match(/^(\d+)h$/i);
        if (hoursOnlyMatch) {
            const hours = parseInt(hoursOnlyMatch[1], 10);
            return Duration.fromTotalMinutes(hours * 60);
        }

        const minutesOnlyMatch = durationText.match(/^(\d+)m$/i);
        if (minutesOnlyMatch) {
            const minutes = parseInt(minutesOnlyMatch[1], 10);
            return Duration.fromTotalMinutes(minutes);
        }

        return null;
    }

    /**
     * Create a Duration from a total number of minutes.
     * Returns null if totalMinutes is zero or negative.
     */
    public static fromTotalMinutes(totalMinutes: number): Duration | null {
        if (totalMinutes <= 0) return null;
        return new Duration({ hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 });
    }

    /** Total duration expressed as minutes. */
    public get totalMinutes(): number {
        return this.hours * 60 + this.minutes;
    }

    /**
     * Returns the canonical text representation of this duration.
     *
     * - `'2h'` for whole hours only.
     * - `'30m'` for minutes only (less than one hour).
     * - `'1h30m'` for hours and minutes combined.
     * - `''` for {@link Duration.None} (zero duration).
     */
    public toText(): string {
        if (this.hours === 0 && this.minutes === 0) {
            return '';
        }
        if (this.minutes === 0) {
            return `${this.hours}h`;
        }
        if (this.hours === 0) {
            return `${this.minutes}m`;
        }
        return `${this.hours}h${this.minutes}m`;
    }
}
