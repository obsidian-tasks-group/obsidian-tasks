export class Duration {
    readonly hours: number;
    readonly minutes: number;

    constructor({ hours, minutes }: { hours: number; minutes: number }) {
        this.hours = hours;
        this.minutes = minutes;
    }

    public static readonly None: Duration = new Duration({ hours: 0, minutes: 0 });
    public static readonly valueRegEx: string = '[0-9]+h[0-9]+m?|[0-9]+h|[0-9]+m?';

    public static fromText(durationText: string): Duration | null {
        try {
            let match = durationText.match(/^(\d+)h$/i);
            if (match != null) {
                if (parseInt(match[1], 10) > 0) {
                    return new Duration({ hours: parseInt(match[1], 10), minutes: 0 });
                }
            }
            match = durationText.match(/^(\d+)m$/i);
            if (match != null) {
                if (parseInt(match[1], 10) > 0) {
                    return new Duration({ hours: 0, minutes: parseInt(match[1], 10) });
                }
            }
            match = durationText.match(/^(\d+)h(\d+)m?$/i);
            if (match != null) {
                if (parseInt(match[1], 10) > 0 || parseInt(match[2], 10) > 0) {
                    return new Duration({ hours: parseInt(match[1], 10), minutes: parseInt(match[2], 10) });
                }
            }
            return null;
        } catch (e) {
            // Could not read recurrence rule. User possibly not done typing.
            // Print error message, as it is useful if a test file has not set up window.moment
            if (e instanceof Error) {
                console.log(e.message);
            }
        }

        return null;
    }

    public toText(): string {
        if (this.hours == 0 && this.minutes == 0) {
            return '';
        }

        return this.hours + 'h' + this.minutes + 'm';
    }
}
