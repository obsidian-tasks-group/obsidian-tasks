<script lang="ts">
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    export let reminderSymbol: string;
    export let reminderTime: string;
    export let isReminderTimeValid: boolean;
    export let accesskey: string | null;

    // A plain 'HH:mm' string, or empty for no reminder. The native time input itself only ever
    // produces one of those two shapes, but this still guards against anything else being poked
    // in directly (for example scripted test input, or a future non-native editor).
    $: isReminderTimeValid = reminderTime === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(reminderTime);
</script>

<label for="reminder">{@html labelContentWithAccessKey('reminder', accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={reminderTime}
    id="reminder"
    type="time"
    class:tasks-modal-error={!isReminderTimeValid}
    class="tasks-modal-date-input"
    {accesskey}
/>

<div class="tasks-modal-parsed-date">
    {reminderSymbol}
</div>

<style>
</style>
