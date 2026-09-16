<script lang="ts">
    import type { Moment } from 'moment';
    import { getSettings } from '../Config/Settings';
    import { resolveTypedSchedule } from '../DateTime/ScheduleParser';
    import { type ReminderSuggestion, buildReminderSuggestions } from '../DateTime/ReminderSuggestions';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    // Bindable - the same raw string shape EditableTask.scheduledDate/reminderTime have always had
    // ('YYYY-MM-DD'/'HH:mm', or '' for "none"). By the time either changes here, it is already a clean,
    // unambiguous value - callers never need to re-run free-text parsing on them.
    export let scheduledDate: string;
    export let reminderTime: string;
    export let isScheduleValid = true;
    export let forwardOnly = false;
    export let scheduledDateSymbol: string;
    export let reminderTimeSymbol: string;
    export let accesskey: string | null = null;
    // The task's CURRENT scheduledDate, frozen at mount time - seeds baselineScheduledDate below, which is
    // what actually gets consulted from then on (see its own doc comment for why the two aren't the same
    // thing beyond that first moment).
    export let originalScheduledDate: Moment | null = null;

    // Both remove buttons blank the visible text field too, not just the underlying date/time - see
    // resetFields()/suppressReparse below for why this can't just be a plain assignment to scheduleText.
    export let onRemoveScheduledDate: () => void = () => resetFields(true, true);
    export let onRemoveReminderTime: () => void = () => resetFields(false, true);

    // Non-Svelte hosts (SchedulePopover.ts) can't use `bind:`; these fire on every change so such a host can
    // track live values for its own Apply button. The embedded, Svelte-to-Svelte case (EditTask.svelte) uses
    // ordinary `bind:` instead and simply leaves these unset.
    //
    // Deliberately called from inside the scheduleText-keyed reactive block below, not as separate `$:`
    // statements of their own - Svelte's reactive-statement dependency analysis only sees direct
    // assignments made textually inside a `$:` block, not ones made by a plain function it calls (like
    // reparseScheduleText below), so a separate `$: onScheduledDateChange?.(scheduledDate)` never re-ran
    // after the first time scheduledDate was actually reassigned via that function (confirmed empirically -
    // it fired once at mount and never again). Piggybacking on the block that scheduleText's own listeners
    // already drive sidesteps that gap entirely, since every path that changes scheduledDate/reminderTime/
    // isScheduleValid in this component also reassigns scheduleText in the same breath (see onDatePicked,
    // onTimePicked, resetFields below).
    export let onScheduledDateChange: ((value: string) => void) | undefined = undefined;
    export let onReminderTimeChange: ((value: string) => void) | undefined = undefined;
    export let onValidityChange: ((value: boolean) => void) | undefined = undefined;

    /** 'YYYY-MM-DD at HH:mm' when both are present, otherwise whichever one there is, or '' for neither -
     *  used to resync the text field after a picker edit (see onDatePicked/onTimePicked below), so a still-
     *  set reminder/date doesn't silently disappear from view just because the OTHER picker was used. Not
     *  used to seed the field on mount - see scheduleText's own initial value below. */
    function formatScheduleText(date: string, time: string): string {
        if (date && time) {
            return `${date} at ${time}`;
        }
        return date || time;
    }

    // Always starts blank, regardless of any existing scheduledDate/reminderTime - the pickers below
    // already show the current values, and re-typing is only needed when the user wants to change
    // something. suppressReparse starting true skips the reactive block's otherwise-automatic first run
    // (Svelte always runs every `$:` block once during initial render) so an empty starting text can never
    // wipe out the real, just-mounted scheduledDate/reminderTime the way a genuine user-cleared field would.
    let scheduleText = '';
    let pickedDate = scheduledDate;
    let pickedTime = reminderTime;
    let suggestions: ReminderSuggestion[] = [];

    // What reparseScheduleText falls back to when the CURRENTLY typed text has no explicit date/time-of-day
    // of its own - the last value that was actually settled on, not the frozen original prop values, and
    // not whatever a moment-ago keystroke happened to leave in scheduledDate/reminderTime. This matters
    // because scheduledDate/reminderTime themselves get provisionally overwritten while the user is still
    // mid-typing a compound phrase ('in a month at 9') - without a separate baseline, backspacing the '9'
    // back off would leave reminderTime stuck at the 09:00 that phrase provisionally resolved to, instead
    // of reverting to whatever it was before that keystroke sequence started (see reparseScheduleText, and
    // the settledElsewhere updates in onDatePicked/onTimePicked/resetFields below). Deliberately NOT updated
    // by reparseScheduleText itself - only by those three, i.e. by genuinely deliberate actions, not by
    // every keystroke's live re-evaluation of the text typed so far.
    let baselineScheduledDate: Moment | null = originalScheduledDate;
    let baselineReminderTime = reminderTime;

    // The same reminder-time quick options ReminderMenu's right-click menu offers - built fresh on each
    // focus, since the relative ones ('in 30 minutes') are computed against 'now'. Only reminder-shaped
    // suggestions are offered (not date presets like 'tomorrow') since those are the values a native
    // datalist popup helps with most - a bare clock time or offset is otherwise easy to mistype.
    function refreshSuggestions() {
        const { reminderPresetTimes, reminderRelativeOffsetsMinutes, reminderRoundingIncrementMinutes, reminderRoundingMode } =
            getSettings();
        const { presetTimes, relativeOffsets } = buildReminderSuggestions(
            reminderPresetTimes,
            reminderRelativeOffsetsMinutes,
            reminderRoundingIncrementMinutes,
            reminderRoundingMode,
            window.moment(),
        );
        suggestions = [...relativeOffsets, ...presetTimes];
    }

    function reparseScheduleText() {
        const trimmed = scheduleText.trim();
        if (trimmed === '') {
            // Blank is this field's own neutral resting state (see scheduleText's initial value above) -
            // not a deliberate "clear the date" instruction, so this reverts both to their baseline rather
            // than actually clearing anything. Only the "Remove scheduled date"/"Remove reminder" buttons
            // (or clearing the native date picker itself - see onDatePicked) are a deliberate enough action
            // to actually null a value out.
            isScheduleValid = true;
            scheduledDate = baselineScheduledDate?.format('YYYY-MM-DD') ?? '';
            pickedDate = scheduledDate;
            reminderTime = baselineReminderTime;
            pickedTime = reminderTime;
            return;
        }

        const { reminderRoundingIncrementMinutes, reminderRoundingMode } = getSettings();
        const resolved = resolveTypedSchedule(
            trimmed,
            window.moment(),
            baselineScheduledDate,
            forwardOnly,
            reminderRoundingIncrementMinutes,
            reminderRoundingMode,
        );
        if (resolved === null) {
            isScheduleValid = false;
            return;
        }
        isScheduleValid = true;
        scheduledDate = resolved.scheduledDate.format('YYYY-MM-DD');
        pickedDate = scheduledDate;
        // Falls back to the baseline, not a no-op, when this parse has no explicit time of its own - see
        // baselineReminderTime's own doc comment for why a plain "leave reminderTime as it currently is"
        // would be wrong here.
        reminderTime = resolved.reminderTime ?? baselineReminderTime;
        pickedTime = reminderTime;
    }

    // Set right before a programmatic change to scheduleText that must NOT go through reparseScheduleText -
    // either the initial blank mount (see scheduleText's own declaration above) or a later reset (see
    // resetFields) - in both cases blanking the text must never cascade into clearing scheduledDate/
    // reminderTime the way a genuine user-cleared field would (see the parser's own empty-text branch
    // below). Consumed (and cleared) the next time the reactive block below runs, so it only ever
    // suppresses a single pass.
    let suppressReparse = true;

    // Re-parses whenever scheduleText changes - on every keystroke (via the bound text input below), when a
    // picked date is copied back into it (see onDatePicked), and once (suppressed, see above) on mount.
    // Also the single place that notifies onScheduledDateChange/onReminderTimeChange/onValidityChange (see
    // their own doc comment above for why they're called from here rather than as their own `$:`
    // statements). Explicitly mentioning `scheduleText` here (rather than only inside reparseScheduleText
    // itself) is what tells Svelte to treat it as this block's dependency - deliberately the ONLY
    // dependency: scheduledDate/reminderTime/pickedDate/pickedTime/isScheduleValid are only ever WRITTEN
    // here (directly or via reparseScheduleText), never read, so writing them (including from onTimePicked,
    // below) never re-triggers this block - unlike the two fields this component replaces, there are
    // several outputs derived from one input here, and looping off their own writes has to be ruled out
    // explicitly.
    $: {
        scheduleText;
        if (suppressReparse) {
            suppressReparse = false;
        } else {
            reparseScheduleText();
        }
        onScheduledDateChange?.(scheduledDate);
        onReminderTimeChange?.(reminderTime);
        onValidityChange?.(isScheduleValid);
    }

    /** Used by both remove buttons' default (embedded-modal) behaviour - clears the text field alongside
     *  whichever underlying value(s) that button removes, bypassing reparseScheduleText entirely so that
     *  blanking the text to remove just the reminder can never cascade into also clearing the date (see
     *  suppressReparse above). */
    function resetFields(clearDate: boolean, clearReminder: boolean) {
        suppressReparse = true;
        isScheduleValid = true;
        scheduleText = '';
        if (clearDate) {
            scheduledDate = '';
            pickedDate = '';
            baselineScheduledDate = null;
        }
        if (clearReminder) {
            reminderTime = '';
            pickedTime = '';
            baselineReminderTime = '';
        }
    }

    function onDatePicked(e: Event) {
        if (e.target === null) {
            return;
        }
        suppressReparse = true;
        if (pickedDate === '') {
            // Cleared via the native picker's own control (e.g. its browser-provided 'x') - a deliberate
            // action in its own right, not the text field's own "nothing typed" resting state, so this
            // actually clears the baseline rather than reparseScheduleText's usual revert-to-baseline
            // (which would otherwise just silently undo the clear).
            scheduledDate = '';
            baselineScheduledDate = null;
        } else {
            // Parse the picked date directly (it's date-only text, so this always leaves reminderTime
            // untouched - see reparseScheduleText's own behaviour), then adopt it as the new baseline -
            // this is as deliberate an action as the task's own original scheduledDate was.
            scheduleText = pickedDate;
            reparseScheduleText();
            baselineScheduledDate = window.moment(scheduledDate);
        }
        scheduleText = formatScheduleText(scheduledDate, reminderTime);
    }

    function onTimePicked(e: Event) {
        if (e.target === null) {
            return;
        }
        reminderTime = pickedTime;
        baselineReminderTime = reminderTime;
        if (scheduledDate === '') {
            // Mirrors SetReminderTime's own "no anchor yet -> default to today" behaviour, applied locally
            // here so the two pickers stay self-consistent without forcing a separate date pick first.
            scheduledDate = window.moment().format('YYYY-MM-DD');
            pickedDate = scheduledDate;
            baselineScheduledDate = window.moment(scheduledDate);
        }
        suppressReparse = true;
        scheduleText = formatScheduleText(scheduledDate, reminderTime);
    }

    $: isOrphaned = reminderTime !== '' && scheduledDate === '';

    const schedulePlaceholder = "Try 'tomorrow at 4pm' or '16:00'";
</script>

<label for="schedule">{@html labelContentWithAccessKey('schedule', accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={scheduleText}
    id="schedule"
    type="text"
    list="schedule-suggestions"
    class:tasks-modal-error={!isScheduleValid}
    class="tasks-modal-date-input"
    placeholder={schedulePlaceholder}
    {accesskey}
    on:focus={refreshSuggestions}
/>
<datalist id="schedule-suggestions">
    {#each suggestions as suggestion (suggestion.value)}
        <option value={suggestion.value}>{suggestion.datalistHint ?? suggestion.label}</option>
    {/each}
</datalist>

<div class="tasks-modal-parsed-date">
    {scheduledDateSymbol}<input
        class="tasks-modal-date-editor-picker"
        type="date"
        bind:value={pickedDate}
        id="schedule-editor-date-picker"
        on:input={onDatePicked}
        tabindex="-1"
    />
    {reminderTimeSymbol}<input
        class="tasks-modal-date-editor-picker"
        type="time"
        bind:value={pickedTime}
        id="schedule-editor-time-picker"
        on:input={onTimePicked}
        tabindex="-1"
    />
</div>

{#if !isScheduleValid}
    <code class="tasks-modal-parsed-date">Could not understand '{scheduleText}' as a schedule.</code>
{:else if reminderTime === ''}
    <code class="tasks-modal-parsed-date"><i>no reminder</i></code>
{:else}
    <code class="tasks-modal-parsed-date">Reminder fires at {reminderTime}{scheduledDate ? ` on ${scheduledDate}` : ''}</code>
{/if}

{#if isOrphaned}
    <p class="tasks-modal-error">
        No scheduled date - this reminder won't fire. Type a date above, or remove the reminder.
    </p>
{/if}

<div class="tasks-modal-schedule-buttons">
    <button type="button" on:click={onRemoveScheduledDate}>Remove scheduled date</button>
    <button type="button" on:click={onRemoveReminderTime}>Remove reminder</button>
</div>

<style>
</style>
