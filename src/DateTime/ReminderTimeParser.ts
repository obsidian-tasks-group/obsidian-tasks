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
 * A single '<number> <unit>' duration term, such as '30 minutes', '2 hours' or '2h'. Chrono's own
 * '+30m'/'+1h' shorthand is inconsistent (the latter parses, the former doesn't), so this is deliberately
 * narrower than whatever chrono itself accepts: only the worded form is treated - and documented in the UI
 * - as relative. This does include the bare 'h' hour abbreviation (chrono itself parses '2 h' as a
 * duration, same as '2 hours'), but not a bare 'm'/'d'/'w' for minutes/days/weeks - chrono itself doesn't
 * understand those ('in 30 m', 'in 3 d' and 'in 2 w' all fail to parse), so there's nothing to flag as
 * relative here either.
 */
const durationTermPattern = /\d+\s*(?:minutes?|mins?|hours?|hrs?|h|days?|weeks?|months?|years?)\b/i;

/**
 * A relative duration, such as 'in 30 minutes', 'in 2 hours', 'in 2h' or a compound one like 'in 3 days 12
 * min' - one or more {@link durationTermPattern} terms in a row (chrono itself accepts them run together
 * like that, or comma-separated; an 'and' between terms is its own separate chrono quirk - it silently
 * drops every term after the first - so isn't specially handled here, that input just resolves to less of
 * an offset than typed, same as chrono resolves it).
 */
const relativeDurationPattern = new RegExp(`^(?:in\\s+)?(?:${durationTermPattern.source}[\\s,]*)+$`, 'i');

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

/**
 * Parses a typed reminder-time string exactly like {@link parseReminderTimeInput}, but additionally rounds
 * a *relative* result (see {@link ParsedReminderTime.isRelative}) up to {@link roundingIncrementMinutes} -
 * the same rounding {@link buildReminderSuggestions} applies to the quick-pick menu/autocomplete items. This
 * is what every place that resolves typed reminder text uses (the edit modal's field, and the "Custom
 * time…" prompt alike), so "in 30 minutes" always means the same rounded time everywhere it's typed - not
 * just when clicking the equivalent menu item.
 *
 * A plain clock time ('09:00') is never rounded either way - rounding only ever applies to relative
 * offsets, matching {@link roundUpToIncrement}'s own scope.
 *
 * @param input - the text the user typed.
 * @param reference - the moment relative-duration inputs are resolved against (typically 'now').
 * @param roundingIncrementMinutes - see {@link roundUpToIncrement}.
 * @returns the parsed (and, if relative, rounded) result, or null if {@link input} could not be understood.
 */
export function resolveTypedReminderTime(
    input: string,
    reference: Moment,
    roundingIncrementMinutes: number,
): ParsedReminderTime | null {
    const parsed = parseReminderTimeInput(input, reference);
    if (parsed === null || !parsed.isRelative) {
        return parsed;
    }

    const date = roundUpToIncrement(parsed.date, roundingIncrementMinutes);
    return { time: date.format('HH:mm'), date, isRelative: true };
}
