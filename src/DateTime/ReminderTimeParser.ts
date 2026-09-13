import * as chrono from 'chrono-node';

/**
 * The result of successfully parsing a typed reminder-time string.
 */
export interface ParsedReminderTime {
    /** The resolved time-of-day, as 'HH:mm'. */
    time: string;
    /** The full resolved date and time (the anchor date shifted by any relative offset, plus the time). */
    date: Moment;
    /** True if {@link input} was a relative offset ('in 30 minutes') rather than a clock time ('09:00'). */
    isRelative: boolean;
}

/**
 * A relative duration, such as 'in 30 minutes' or 'in 2 hours'. Chrono's own '+30m'/'+1h' shorthand is
 * inconsistent (the latter parses, the former doesn't), so this is deliberately narrower than whatever
 * chrono itself accepts: only the worded form is treated - and documented in the UI - as relative.
 */
const relativeDurationPattern = /^(?:in\s+)?\d+\s*(?:minutes?|mins?|hours?|hrs?)\b/i;

/**
 * Parses a typed reminder-time string - either a clock time ('09:00', '9am') or a relative offset from
 * {@link reference} ('in 30 minutes', 'in 2 hours') - into a resolved date and time.
 *
 * This is not built on {@link DateParser.parseDate}: that helper calls `.startOf('day')`, deliberately
 * discarding time-of-day, which is the one thing this needs to keep.
 *
 * @param input - the text the user typed.
 * @param reference - the moment relative-duration inputs are resolved against (typically 'now').
 * @returns the parsed result, or null if {@link input} could not be understood.
 */
export function parseReminderTimeInput(input: string, reference: Moment): ParsedReminderTime | null {
    const trimmed = input.trim();
    if (!trimmed) {
        return null;
    }

    const parsedDate = chrono.parseDate(trimmed, reference.toDate(), { forwardDate: true });
    if (parsedDate === null) {
        return null;
    }

    const date = window.moment(parsedDate);
    return {
        time: date.format('HH:mm'),
        date,
        isRelative: relativeDurationPattern.test(trimmed),
    };
}

/**
 * Round {@link date} forward to the next multiple of {@link incrementMinutes} past the hour (for example,
 * with a 30-minute increment, 14:07 becomes 14:30 and 14:31 becomes 15:00). An {@link incrementMinutes} of
 * 0 or less means "no rounding" - {@link date} is returned as-is (seconds/milliseconds still cleared).
 *
 * Used only for the dynamically-computed relative menu items - free-text input (the modal field, or the
 * "Custom time…" prompt) is never rounded, since a typed value is already a deliberate choice.
 */
export function roundUpToIncrement(date: Moment, incrementMinutes: number): Moment {
    const rounded = date.clone().seconds(0).milliseconds(0);
    if (incrementMinutes <= 0) {
        return rounded;
    }
    const remainder = rounded.minutes() % incrementMinutes;
    if (remainder !== 0) {
        rounded.add(incrementMinutes - remainder, 'minutes');
    }
    return rounded;
}
