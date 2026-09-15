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
 * A single '<quantity> <unit>' duration term, such as '30 minutes', '2 hours', '2h' or 'a week' (chrono
 * treats the word quantifiers 'a'/'an' as equivalent to '1' - 'a day', 'an hour' - same as the numeral
 * form). Chrono's own '+30m'/'+1h' shorthand is inconsistent (the latter parses, the former doesn't), so
 * this is deliberately narrower than whatever chrono itself accepts: only the worded form is treated - and
 * documented in the UI - as relative. This does include the bare 'h' hour abbreviation (chrono itself
 * parses '2 h' as a duration, same as '2 hours'), but not a bare 'm'/'d'/'w' for minutes/days/weeks -
 * chrono itself doesn't understand those ('in 30 m', 'in 3 d' and 'in 2 w' all fail to parse), so there's
 * nothing to flag as relative here either.
 */
const durationTermPattern = /(?:\d+|an?\b)\s*(?:minutes?|mins?|hours?|hrs?|h|days?|weeks?|months?|years?)\b/i;

/**
 * A relative duration, such as 'in 30 minutes', 'in 2 hours', 'in 2h', 'in a week' or a compound one like
 * 'in 3 days 12 min' - one or more {@link durationTermPattern} terms in a row (chrono itself accepts them
 * run together like that, or comma-separated; an 'and' between terms is its own separate chrono quirk - it
 * silently drops every term after the first - so isn't specially handled here, that input just resolves to
 * less of an offset than typed, same as chrono resolves it), optionally followed by a clock-time clause
 * ('in a week at 5pm', 'in 3 days at 17:00') that overrides which time of that day is used - chrono
 * supports many time formats there, so this only checks for the 'at' keyword and leaves validating
 * whatever follows it to chrono itself.
 */
export const relativeDurationPattern = new RegExp(
    `^(?:in\\s+)?(?:${durationTermPattern.source}[\\s,]*)+(?:at\\s+.+)?$`,
    'i',
);

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
 * How {@link roundToIncrement} snaps a date to the nearest multiple of its increment - matching the
 * `reminderRoundingMode` setting (see {@link Settings}):
 * - `'floor'` - always rounds down/back, to the multiple at or before {@link date}.
 * - `'ceil'` - always rounds up/forward, to the multiple at or after {@link date} (the only behaviour this
 *   ever had before the mode became configurable).
 * - `'round'` - to whichever of the two is closest, ties (exactly halfway) rounding forward like `'ceil'`.
 */
export type RoundingMode = 'floor' | 'round' | 'ceil';

/**
 * Round {@link date} to a multiple of {@link incrementMinutes} past the hour, per {@link mode} (for
 * example, with a 30-minute increment and `'ceil'`, 14:07 becomes 14:30 and 14:31 becomes 15:00). An
 * {@link incrementMinutes} of 0 or less means "no rounding" - {@link date} is returned as-is
 * (seconds/milliseconds still cleared), regardless of {@link mode}.
 */
export function roundToIncrement(date: Moment, incrementMinutes: number, mode: RoundingMode): Moment {
    const rounded = date.clone().seconds(0).milliseconds(0);
    if (incrementMinutes <= 0) {
        return rounded;
    }
    const remainder = rounded.minutes() % incrementMinutes;
    if (remainder === 0) {
        return rounded;
    }
    const roundForward = mode === 'ceil' || (mode === 'round' && remainder * 2 >= incrementMinutes);
    return roundForward ? rounded.add(incrementMinutes - remainder, 'minutes') : rounded.subtract(remainder, 'minutes');
}

/**
 * Parses a typed reminder-time string exactly like {@link parseReminderTimeInput}, but additionally rounds
 * a *relative* result (see {@link ParsedReminderTime.isRelative}) to {@link roundingIncrementMinutes}/
 * {@link roundingMode} - the same rounding {@link buildReminderSuggestions} applies to the quick-pick
 * menu/autocomplete items. This is what every place that resolves typed reminder text uses (the edit
 * modal's field, and the "Custom time…" prompt alike), so "in 30 minutes" always means the same rounded
 * time everywhere it's typed - not just when clicking the equivalent menu item.
 *
 * A plain clock time ('09:00') is never rounded either way - rounding only ever applies to relative
 * offsets, matching {@link roundToIncrement}'s own scope.
 *
 * @param input - the text the user typed.
 * @param reference - the moment relative-duration inputs are resolved against (typically 'now').
 * @param roundingIncrementMinutes - see {@link roundToIncrement}.
 * @param roundingMode - see {@link RoundingMode}.
 * @returns the parsed (and, if relative, rounded) result, or null if {@link input} could not be understood.
 */
export function resolveTypedReminderTime(
    input: string,
    reference: Moment,
    roundingIncrementMinutes: number,
    roundingMode: RoundingMode,
): ParsedReminderTime | null {
    const parsed = parseReminderTimeInput(input, reference);
    if (parsed === null || !parsed.isRelative) {
        return parsed;
    }

    const date = roundToIncrement(parsed.date, roundingIncrementMinutes, roundingMode);
    return { time: date.format('HH:mm'), date, isRelative: true };
}
