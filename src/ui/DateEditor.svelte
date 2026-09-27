<script lang="ts">
    import { doAutocomplete } from '../DateTime/DateAbbreviations';
    import { parseTypedDateForDisplayUsingFutureDate } from '../DateTime/DateTools';
    import { labelContentWithAccessKey } from './EditTaskHelpers';
    import { useIconsForDisplay } from './Icons';

    export let id: 'start' | 'scheduled' | 'due' | 'done' | 'created' | 'cancelled';
    export let dateSymbol: string;
    export let date: string;
    export let isDateValid: boolean;
    export let forwardOnly: boolean;
    export let accesskey: string | null;

    // Use this for testing purposes only
    export let parsedDate: string = '';

    let pickedDate = '';

    $: {
        date = doAutocomplete(date);
        parsedDate = parseTypedDateForDisplayUsingFutureDate(id, date, forwardOnly);
        isDateValid = !parsedDate.includes('invalid');
        if (isDateValid) {
            pickedDate = parsedDate;
        }
    }

    function onDatePicked(e: Event) {
        if (e.target === null) {
            return;
        }
        date = pickedDate;
    }

    // 'weekend' abbreviation omitted due to lack of space.
    const datePlaceholder = "Try 'Mon' or 'tm' then space";

    const useIcons = useIconsForDisplay();
    const dateLabel = id.charAt(0).toUpperCase() + id.slice(1) + ' date';
</script>

<label for={id}>{@html labelContentWithAccessKey(id, accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={date}
    {id}
    type="text"
    class:tasks-modal-error={!isDateValid}
    class="tasks-modal-date-input"
    placeholder={datePlaceholder}
    {accesskey}
/>

{#if isDateValid}
    <!-- The native date picker already shows a calendar, so no field icon is added here. -->
    <div class="tasks-modal-parsed-date" class:tasks-show-emoji={!useIcons}>
        {#if !useIcons}{dateSymbol}{/if}<input
            class="tasks-modal-date-editor-picker"
            type="date"
            bind:value={pickedDate}
            id="date-editor-picker-{id}"
            aria-label="Pick {dateLabel}"
            on:input={onDatePicked}
            tabindex="-1"
        />
    </div>
{:else}
    <span class="tasks-modal-parsed-date tasks-modal-parsed-message"
        >{#if !useIcons}{dateSymbol}{/if}
        {@html parsedDate}</span
    >
{/if}

<style>
</style>
