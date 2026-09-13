import { roundUpToIncrement } from './ReminderTimeParser';

/**
 * One quick reminder-time option:
 * - {@link value} is what fills the modal's text field if this suggestion is picked there (and is what
 *   {@link parseReminderTimeInput} would make of it, if typed) - a plain time for a preset, or the
 *   relative phrase itself ('in 30 minutes') for a relative offset.
 * - {@link label} is what's shown to the user, in both the menu and the modal's autocomplete list. A
 *   relative offset's time is prefixed with '~' whenever rounding is enabled (`roundingIncrementMinutes` >
 *   0), e.g. 'In 30 minutes (~11:00)' - flagging that the time shown (and applied) is a rounded
 *   approximation of "30 minutes from now", not that exact instant. With rounding disabled, the same
 *   suggestion reads 'In 30 minutes (11:00)', no tilde, since it is then the exact offset.
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
 * Build the shared list of quick reminder-time suggestions, from the three settings
 * (`reminderPresetTimes`, `reminderRelativeOffsetsMinutes`, `reminderRoundingIncrementMinutes` - see
 * {@link Settings}). Used by both {@link ReminderMenu} (the rendered line's click/right-click menu) and
 * {@link ReminderEditor} (the edit modal's autocomplete), so the two stay in sync by construction rather
 * than by convention - "same options" is guaranteed by both reading from this one function.
 *
 * Relative offsets are computed fresh against {@link now} and rounded to
 * {@link roundingIncrementMinutes}, so a quick pick lands on a clean time; their {@link
 * ReminderSuggestion.value} is nonetheless the relative phrase itself ('in 30 minutes'), not the resolved
 * clock time - so that whichever of the two consumers applies it (immediately, for the menu; whenever the
 * modal's Apply is eventually pressed) resolves it fresh, and - crucially - still carries a full date, so
 * a day-boundary crossing still shifts the task's anchor date (see {@link SetReminderDateTime}).
 */
export function buildReminderSuggestions(
    presetTimes: string[],
    relativeOffsetsMinutes: number[],
    roundingIncrementMinutes: number,
    now: Moment,
): ReminderSuggestions {
    // Whether rounding applies at all - not whether it happened to change *this particular* target (which
    // would depend on what 'now' is at the moment the menu happens to open, and so make the label flicker
    // between wording depending on the minute). The setting is what the user chose, so it's what's reported.
    const isRounded = roundingIncrementMinutes > 0;

    return {
        presetTimes: presetTimes.map((time) => ({ value: time, label: time })),
        relativeOffsets: relativeOffsetsMinutes.map((offsetMinutes) => {
            const target = roundUpToIncrement(now.clone().add(offsetMinutes, 'minutes'), roundingIncrementMinutes);
            const time = target.format('HH:mm');
            return {
                value: `in ${offsetPhrase(offsetMinutes)}`,
                label: `In ${offsetPhrase(offsetMinutes)} (${isRounded ? `~${time}` : time})`,
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
