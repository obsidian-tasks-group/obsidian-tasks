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
    // The task's CURRENT scheduledDate, frozen at mount time - see resolveTypedSchedule's own doc comment
    // for why this must not be re-derived from scheduledDate above as the user types.
    export let originalScheduledDate: Moment | null = null;

    export let onRemoveScheduledDate: () => void = () => {
        scheduledDate = '';
        reminderTime = '';
    };
    export let onRemoveReminderTime: () => void = () => {
        reminderTime = '';
    };

    // Non-Svelte hosts (ScheduleDialog.ts) can't use `bind:`; these fire on every change so such a host can
    // track live values for its own Apply button. The embedded, Svelte-to-Svelte case (EditTask.svelte) uses
    // ordinary `bind:` instead and simply leaves these unset.
    export let onScheduledDateChange: ((value: string) => void) | undefined = undefined;
    export let onReminderTimeChange: ((value: string) => void) | undefined = undefined;
    export let onValidityChange: ((value: boolean) => void) | undefined = undefined;
    $: onScheduledDateChange?.(scheduledDate);
    $: onReminderTimeChange?.(reminderTime);
    $: onValidityChange?.(isScheduleValid);

    // Seeded from the date only, not a synthesized 'date + time' string - the existing reminder is already
    // visible via the time picker below, so there is no need to invent a combined-text grammar just to
    // round-trip it back into view.
    let scheduleText = scheduledDate;
    let pickedDate = scheduledDate;
    let pickedTime = reminderTime;
    let suggestions: ReminderSuggestion[] = [];

    // The same reminder-time quick options ReminderMenu's right-click menu offers - built fresh on each
    // focus, since the relative ones ('in 30 minutes') are computed against 'now'. Only reminder-shaped
    // suggestions are offered (not date presets like 'tomorrow') since those are the values a native
    // datalist popup helps with most - a bare clock time or offset is otherwise easy to mistype.
    function refreshSuggestions() {
        const { reminderPresetTimes, reminderRelativeOffsetsMinutes, reminderRoundingIncrementMinutes } =
            getSettings();
        const { presetTimes, relativeOffsets } = buildReminderSuggestions(
            reminderPresetTimes,
            reminderRelativeOffsetsMinutes,
            reminderRoundingIncrementMinutes,
            window.moment(),
        );
        suggestions = [...presetTimes, ...relativeOffsets];
    }

    function reparseScheduleText() {
        const trimmed = scheduleText.trim();
        if (trimmed === '') {
            isScheduleValid = true;
            scheduledDate = '';
            pickedDate = '';
            // reminderTime is deliberately left untouched here - see the "Empty text behavior" decision:
            // this may leave an orphaned reminder (reminderTime set, no scheduledDate), which is surfaced
            // by the warning message below and, in the rendered view, an error pill - never silently
            // cascaded away by just clearing text.
            return;
        }

        const { reminderRoundingIncrementMinutes } = getSettings();
        const resolved = resolveTypedSchedule(
            trimmed,
            window.moment(),
            originalScheduledDate,
            forwardOnly,
            reminderRoundingIncrementMinutes,
        );
        if (resolved === null) {
            isScheduleValid = false;
            return;
        }
        isScheduleValid = true;
        scheduledDate = resolved.scheduledDate.format('YYYY-MM-DD');
        pickedDate = scheduledDate;
        if (resolved.reminderTime !== null) {
            reminderTime = resolved.reminderTime;
            pickedTime = reminderTime;
        }
    }

    // Re-parses whenever scheduleText changes - on every keystroke (via the bound text input below), when
    // a picked date is copied back into it (see onDatePicked), AND once immediately on mount, so an
    // already-invalid seed value (e.g. an unparseable pre-existing scheduledDate) is flagged straight away,
    // the same way DateEditor's own reactive block does today. Explicitly mentioning `scheduleText` here
    // (rather than only inside reparseScheduleText itself) is what tells Svelte to treat it as this block's
    // dependency - deliberately the ONLY dependency: scheduledDate/reminderTime/pickedDate/pickedTime are
    // only ever WRITTEN here, never read, so writing them (including from onTimePicked, below) never
    // re-triggers this block - unlike the two fields this component replaces, there are two outputs derived
    // from one input here, and looping off their own writes has to be ruled out explicitly.
    $: {
        scheduleText;
        reparseScheduleText();
    }

    function onDatePicked(e: Event) {
        if (e.target === null) {
            return;
        }
        scheduleText = pickedDate;
    }

    function onTimePicked(e: Event) {
        if (e.target === null) {
            return;
        }
        reminderTime = pickedTime;
        if (scheduledDate === '') {
            // Mirrors SetReminderTime's own "no anchor yet -> default to today" behaviour, applied locally
            // here so the two pickers stay self-consistent without forcing a separate date pick first.
            scheduledDate = window.moment().format('YYYY-MM-DD');
            pickedDate = scheduledDate;
            scheduleText = scheduledDate;
        }
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
        <option value={suggestion.value}>{suggestion.label}</option>
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
