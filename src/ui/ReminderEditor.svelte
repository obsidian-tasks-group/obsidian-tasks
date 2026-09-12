<script lang="ts">
    import { parseReminderTimeInput } from '../DateTime/ReminderTimeParser';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    export let reminderSymbol: string;
    export let reminderTime: string;
    export let isReminderTimeValid: boolean;
    export let accesskey: string | null;

    // Use this for testing purposes only
    export let parsedReminderTime: string = '';

    let pickedTime = '';

    $: {
        const trimmed = reminderTime.trim();
        if (trimmed === '') {
            parsedReminderTime = '<i>no reminder</i>';
            isReminderTimeValid = true;
            pickedTime = '';
        } else {
            const parsed = parseReminderTimeInput(trimmed, window.moment());
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
    class:tasks-modal-error={!isReminderTimeValid}
    class="tasks-modal-date-input"
    placeholder={reminderPlaceholder}
    {accesskey}
/>

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
