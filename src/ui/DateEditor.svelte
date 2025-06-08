<script lang="ts">
    import { doAutocomplete } from '../DateTime/DateAbbreviations';
    import { parseTypedDateForDisplayUsingFutureDate } from '../DateTime/DateTools';
    // import { labelContentWithAccessKey } from './EditTaskHelpers';

    export let id: 'start' | 'scheduled' | 'due' | 'done' | 'created' | 'cancelled';
    // export let dateSymbol: string;
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
    if (id === 'due' && date === '') {
        date = parseTypedDateForDisplayUsingFutureDate(id, 'today', forwardOnly);
    }
</script>

{#if isDateValid}
    <div class="tasks-modal-parsed-date">
        <input
            class="tasks-modal-date-editor-picker"
            type="date"
            bind:value={pickedDate}
            id="date-editor-picker"
            on:input={onDatePicked}
            tabindex="-1"
        />
    </div>
{:else}
    <code class="tasks-modal-parsed-date">{@html parsedDate}</code>
{/if}

<label for={id} />
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

<style>
</style>
