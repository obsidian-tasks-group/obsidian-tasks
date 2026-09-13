<script lang="ts">
    import { getSettings } from '../Config/Settings';
    import { type ReminderSuggestion, buildReminderSuggestions } from '../DateTime/ReminderSuggestions';
    import { resolveTypedReminderTime } from '../DateTime/ReminderTimeParser';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    export let reminderSymbol: string;
    export let reminderTime: string;
    export let isReminderTimeValid: boolean;
    export let accesskey: string | null;

    // Use this for testing purposes only
    export let parsedReminderTime: string = '';

    let pickedTime = '';
    let suggestions: ReminderSuggestion[] = [];

    // The same options offered in the rendered line's click/right-click menu (see ReminderMenu) - built
    // fresh on each focus, since the relative ones ('in 30 minutes') are computed against 'now'.
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

    // Deliberately not populated eagerly at mount: the relative offsets depend on the current time, and a
    // native datalist popup only ever appears in response to the input gaining focus (or being typed in)
    // anyway, so there is nothing to show before then. This also keeps a freshly-rendered modal's HTML
    // independent of wall-clock time, which matters for the deterministic HTML-snapshot tests of this form.

    $: {
        const trimmed = reminderTime.trim();
        if (trimmed === '') {
            parsedReminderTime = '<i>no reminder</i>';
            isReminderTimeValid = true;
            pickedTime = '';
        } else {
            // Rounds a relative offset ('in 30 minutes') the same way the quick-pick suggestions above do,
            // so typing (or picking one, then submitting) behaves the same as clicking the equivalent menu
            // item - not the exact, unrounded offset. A plain clock time ('09:00') is unaffected either way.
            const { reminderRoundingIncrementMinutes } = getSettings();
            const parsed = resolveTypedReminderTime(trimmed, window.moment(), reminderRoundingIncrementMinutes);
            if (parsed === null) {
                parsedReminderTime = '<i>invalid reminder time</i>';
                isReminderTimeValid = false;
            } else {
                parsedReminderTime = parsed.time;
                isReminderTimeValid = true;
                pickedTime = parsed.time;
            }
        }
    }

    function onTimePicked(e: Event) {
        if (e.target === null) {
            return;
        }
        reminderTime = pickedTime;
    }

    const reminderPlaceholder = "Try '09:00' or 'in 30 minutes'";
</script>

<label for="reminder">{@html labelContentWithAccessKey('reminder', accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={reminderTime}
    id="reminder"
    type="text"
    list="reminder-suggestions"
    class:tasks-modal-error={!isReminderTimeValid}
    class="tasks-modal-date-input"
    placeholder={reminderPlaceholder}
    {accesskey}
    on:focus={refreshSuggestions}
/>
<datalist id="reminder-suggestions">
    {#each suggestions as suggestion (suggestion.value)}
        <option value={suggestion.value}>{suggestion.label}</option>
    {/each}
</datalist>

{#if isReminderTimeValid}
    <div class="tasks-modal-parsed-date">
        {reminderSymbol}<input
            class="tasks-modal-date-editor-picker"
            type="time"
            bind:value={pickedTime}
            id="reminder-editor-picker"
            on:input={onTimePicked}
            tabindex="-1"
        />
    </div>
{:else}
    <code class="tasks-modal-parsed-date">{reminderSymbol} {@html parsedReminderTime}</code>
{/if}

<style>
</style>
