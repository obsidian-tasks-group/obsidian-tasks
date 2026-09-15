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
 */
export interface ReminderSuggestion {
    value: string;
    label: string;
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
            const exactMinutes = Math.round(target.diff(now, 'minutes', true));
            return {
                value: `in ${offsetPhrase(offsetMinutes)}`,
                label: `In ${offsetPhrase(exactMinutes)} (${target.format('HH:mm')})`,
                resolvedDate: target,
            };
        }),
    };
}

function offsetPhrase(offsetMinutes: number): string {
    if (offsetMinutes % 60 === 0) {
        const hours = offsetMinutes / 60;
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return `${offsetMinutes} minutes`;
}
