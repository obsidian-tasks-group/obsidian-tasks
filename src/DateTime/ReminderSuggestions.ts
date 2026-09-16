import { type RoundingMode, roundToIncrement } from './ReminderTimeParser';

/**
 * One quick reminder-time option:
 * - {@link value} is what fills the modal's text field if this suggestion is picked there (and is what
 *   {@link parseReminderTimeInput} would make of it, if typed) - a plain time for a preset, or the
 *   *configured* relative phrase itself ('in 30 minutes') for a relative offset, regardless of how that
 *   offset happened to round for display in {@link label} (see below) - so re-parsing it later resolves
 *   fresh from whatever 'now' is by then, the same as if the user had typed it themselves.
 * - {@link label} is what's shown to the user, in both the menu and the modal's autocomplete list. A
 *   relative offset's label states the *exact* time remaining until the rounded target, not the nominal
 *   configured duration - e.g. a configured "in 30 minutes" that rounds forward to a clean 19:00 reads
 *   'In 53 minutes (19:00)', not 'In 30 minutes (19:00)', so the label is always literally true rather than
 *   an approximation needing a "~" to flag it. With rounding disabled the two happen to coincide.
 * - {@link resolvedDate}, present only for relative offsets, is the already-rounded target moment. The
 *   menu must apply *this*, not re-parse {@link value}: re-parsing 'in 30 minutes' at click time would
 *   resolve to the exact, unrounded offset from 'now', silently discarding the rounding {@link label}
 *   promised. The modal has no equivalent need - it only ever fills the field with {@link value}, and
 *   resolves it (deliberately unrounded - see {@link buildReminderSuggestions}) whenever Apply is
 *   eventually pressed.
 * - {@link datalistHint}, present only for relative offsets, is what the modal's native `<datalist>` shows
 *   as the second column alongside {@link value} (see {@link ScheduleEditor}) - a browser renders an
 *   `<option value>` and its child text as two adjacent columns whenever they differ, so unlike {@link
 *   label} (a standalone description, used by the menu, where there's no separate "value" column to read
 *   alongside it) this is deliberately a continuation of {@link value} rather than self-contained - e.g.
 *   'in 30 minutes' + '(rounded to 11:30, in 17 minutes)', not another full restatement of "in 30 minutes".
 *   Absent for presets, where {@link value} and {@link label} already coincide and a browser shows only one
 *   column.
 */
export interface ReminderSuggestion {
    value: string;
    label: string;
    datalistHint?: string;
    resolvedDate?: Moment;
}

export interface ReminderSuggestions {
    presetTimes: ReminderSuggestion[];
    relativeOffsets: ReminderSuggestion[];
}

/**
 * Build the shared list of quick reminder-time suggestions, from the four settings
 * (`reminderPresetTimes`, `reminderRelativeOffsetsMinutes`, `reminderRoundingIncrementMinutes`,
 * `reminderRoundingMode` - see {@link Settings}). Used by both {@link ReminderMenu} (the rendered line's
 * click/right-click menu) and {@link ScheduleEditor} (the edit modal/dialog's autocomplete), so the two stay
 * in sync by construction rather than by convention - "same options" is guaranteed by both reading from
 * this one function.
 *
 * Relative offsets are computed fresh against {@link now} and rounded to
 * {@link roundingIncrementMinutes}/{@link roundingMode}, so a quick pick lands on a clean time; their
 * {@link ReminderSuggestion.value} is nonetheless the relative phrase itself ('in 30 minutes'), not the
 * resolved clock time - so that whichever of the two consumers applies it (immediately, for the menu;
 * whenever the modal's Apply is eventually pressed) resolves it fresh, and - crucially - still carries a
 * full date, so a day-boundary crossing still shifts the task's anchor date (see
 * {@link SetReminderDateTime}).
 */
export function buildReminderSuggestions(
    presetTimes: string[],
    relativeOffsetsMinutes: number[],
    roundingIncrementMinutes: number,
    roundingMode: RoundingMode,
    now: Moment,
): ReminderSuggestions {
    return {
        presetTimes: presetTimes.map((time) => ({ value: time, label: time })),
        relativeOffsets: relativeOffsetsMinutes.map((offsetMinutes) => {
            const target = roundToIncrement(
                now.clone().add(offsetMinutes, 'minutes'),
                roundingIncrementMinutes,
                roundingMode,
            );
            // 'floor'/'round' can land at or before 'now' (unlike 'ceil', which never can, since it only
            // ever rounds the already-in-the-future raw target forward) - a reminder suggested as "from
            // now" must never resolve to a time that's already passed, so nudge forward by whole
            // increments until it's not. Needs no guard against an infinite loop: each iteration adds a
            // fixed, positive amount, so it terminates in at most one or two passes.
            while (roundingIncrementMinutes > 0 && !target.isAfter(now)) {
                target.add(roundingIncrementMinutes, 'minutes');
            }
            // The exact gap from 'now' to the rounded target - not offsetMinutes itself, which is only
            // what the target was rounded *from*. With rounding disabled the two are the same value.
            // Diffed against 'now' floored to the minute (matching what a clock displays, and what
            // roundToIncrement already floors its own result to) rather than the real, sub-minute-precise
            // 'now' - otherwise a few seconds already elapsed in the current minute silently steals a
            // whole minute off the result (e.g. at 19:23:45, a target of 19:30:00 is only 6.25 real minutes
            // away, rounding down to 6 - one less than the 7 minutes '23' to '30' actually reads as).
            const exactMinutes = target.diff(now.clone().seconds(0).milliseconds(0), 'minutes');
            return {
                value: `in ${offsetPhrase(offsetMinutes)}`,
                label: `In ${offsetPhrase(exactMinutes)} (${target.format('HH:mm')})`,
                datalistHint: `(rounded to ${target.format('HH:mm')}, in ${offsetPhrase(exactMinutes)})`,
                resolvedDate: target,
            };
        }),
    };
}

function offsetPhrase(offsetMinutes: number): string {
    if (offsetMinutes < 60) {
        return `${offsetMinutes} minute${offsetMinutes === 1 ? '' : 's'}`;
    }
    const hours = Math.floor(offsetMinutes / 60);
    const minutes = offsetMinutes % 60;
    const hoursPhrase = `${hours} hour${hours === 1 ? '' : 's'}`;
    if (minutes === 0) {
        return hoursPhrase;
    }
    return `${hoursPhrase} ${minutes} minute${minutes === 1 ? '' : 's'}`;
}
