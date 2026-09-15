import * as chrono from 'chrono-node';
import { type RoundingMode, relativeDurationPattern, roundToIncrement } from './ReminderTimeParser';

/**
 * The result of successfully parsing a typed 'Schedule' string - the single unified text field that drives
 * both {@link Task.scheduledDate} and {@link Task.reminderTime}.
 */
export interface ParsedSchedule {
    /** What {@link Task.scheduledDate} should become. Always `.startOf('day')`. */
    scheduledDate: Moment;
    /**
     * What {@link Task.reminderTime} should become, as 'HH:mm' - or `null` if {@link input} had no explicit
     * time-of-day component, meaning the caller should leave the task's existing {@link Task.reminderTime}
     * completely untouched (this is a "no change" signal, not "clear the reminder" - clearing is only ever
     * done via the dedicated remove instructions/buttons, never by typing text).
     */
    reminderTime: string | null;
    /** True if the resolved time came from a relative/duration expression ('in 30 minutes'), for callers
     *  that want to know whether rounding was already applied (see {@link roundToIncrement}). */
    isRelative: boolean;
}

/**
 * Words that resolve a specific time-of-day without chrono marking `hour`/`minute` certain for them
 * (confirmed empirically against chrono-node) - treated as explicit time-of-day anyway, since a user typing
 * either word clearly means a specific time, not merely "sometime this day".
 */
const explicitTimeWordPattern = /\b(noon|midnight)\b/i;

/**
 * The same two words, matched as the *entire* trimmed input. Needed because a bare 'midnight' happens to
 * mark day/month/year certain in chrono (even though it carries no date wording of its own), while a bare
 * 'noon' does not - an asymmetry confirmed empirically. Both are forced to be treated identically, as bare
 * clock-time input with no date part, by excluding them from {@link hasExplicitDatePart} explicitly.
 */
const bareNoonOrMidnightPattern = /^(noon|midnight)$/i;

function hasExplicitTimeOfDay(start: chrono.ParsedComponents, trimmedInput: string): boolean {
    return start.isCertain('hour') || start.isCertain('minute') || explicitTimeWordPattern.test(trimmedInput);
}

function hasExplicitDatePart(start: chrono.ParsedComponents, trimmedInput: string): boolean {
    if (bareNoonOrMidnightPattern.test(trimmedInput)) {
        return false;
    }
    return (
        start.isCertain('day') ||
        start.isCertain('month') ||
        start.isCertain('year') ||
        start.isCertain('weekday') ||
        // Week/month-based durations ('in a week') don't mark 'day' certain even though they do resolve a
        // date (confirmed empirically) - fall back to the same narrow regex ReminderTimeParser already
        // uses to classify relative offsets. This also means every relative-duration expression,
        // 'in 30 minutes' included, always counts as "has an explicit date part", so it unconditionally
        // shifts scheduledDate - matching today's SetReminderDateTime anchor-shifting behaviour.
        relativeDurationPattern.test(trimmedInput)
    );
}

/**
 * Resolves a single typed 'Schedule' string into both {@link Task.scheduledDate} and
 * {@link Task.reminderTime}, per the unified-field rule: an input with an explicit time-of-day updates
 * both; a date-only input updates only the date ({@link ParsedSchedule.reminderTime} is `null`, meaning
 * "leave {@link Task.reminderTime} exactly as it is").
 *
 * @param input - the text the user typed.
 * @param reference - the moment relative expressions are resolved against (typically 'now').
 * @param existingScheduledDate - the task's CURRENT {@link Task.scheduledDate}, frozen at the point editing
 *   started (dialog/modal-open time) - not re-derived from any in-progress edit, or the "a bare time never
 *   moves an existing scheduled date" rule below would self-referentially interact with every keystroke.
 *   Only consulted for a bare clock-time input with no date wording of its own ('16:00', '4pm', 'noon',
 *   'midnight'): if non-null, that date is kept and only the time changes; if null, a new date is derived
 *   (today if the time is still to come, else tomorrow - chrono's own `forwardDate` option does not roll a
 *   bare time-of-day forward by itself, only day/month/weekday-only expressions, so this is done by hand).
 * @param forwardDate - mirrors the modal's existing "Only future dates" checkbox.
 * @param roundingIncrementMinutes - see {@link roundToIncrement}. Only ever applied to a relative offset's
 *   time, never to an absolute clock time, and never to a date-only relative phrase.
 * @param roundingMode - see {@link RoundingMode}.
 * @returns the parsed result, or `null` if {@link input} is empty or could not be understood.
 */
export function resolveTypedSchedule(
    input: string,
    reference: Moment,
    existingScheduledDate: Moment | null,
    forwardDate: boolean,
    roundingIncrementMinutes: number,
    roundingMode: RoundingMode,
): ParsedSchedule | null {
    const trimmed = input.trim();
    if (trimmed === '') {
        return null;
    }

    const results = chrono.parse(trimmed, reference.toDate(), { forwardDate });
    if (results.length === 0) {
        return null;
    }

    // Only the first match is considered - the same precedent DateParser.parseAbsoluteDateRange already
    // relies on, the only other existing chrono.parse() (rather than chrono.parseDate()) use in this
    // codebase.
    const start = results[0].start;
    const hasTime = hasExplicitTimeOfDay(start, trimmed);
    const hasDate = hasExplicitDatePart(start, trimmed);
    const isRelative = relativeDurationPattern.test(trimmed);

    let resolved = window.moment(start.date());

    if (hasTime && !hasDate) {
        // A bare clock time with no date wording of its own.
        if (existingScheduledDate !== null) {
            resolved = existingScheduledDate.clone().set({
                hour: resolved.hour(),
                minute: resolved.minute(),
                second: 0,
                millisecond: 0,
            });
        } else if (forwardDate && !resolved.isAfter(reference)) {
            resolved = resolved.add(1, 'day');
        }
    }

    const final = isRelative && hasTime ? roundToIncrement(resolved, roundingIncrementMinutes, roundingMode) : resolved;

    return {
        scheduledDate: final.clone().startOf('day'),
        reminderTime: hasTime ? final.format('HH:mm') : null,
        isRelative,
    };
}
