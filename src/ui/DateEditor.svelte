<script lang="ts">
    import { doAutocomplete } from '../DateTime/DateAbbreviations';
    import { parseTypedDateForDisplayUsingFutureDate } from '../DateTime/DateTools';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    interface Props {
        id: 'start' | 'scheduled' | 'due' | 'done' | 'created' | 'cancelled';
        dateSymbol: string;
        date: string;
        isDateValid: boolean;
        forwardOnly: boolean;
        accesskey: string | null;
        parsedDate?: string;
    }

    let {
        id,
        dateSymbol,
        date = $bindable(''),
        isDateValid = $bindable(false),
        forwardOnly,
        accesskey,
        parsedDate = $bindable(''),
    }: Props = $props();

    let pickedDate = $state('');

    $effect(() => {
        const nextDate = doAutocomplete(date);
        const nextParsedDate = parseTypedDateForDisplayUsingFutureDate(id, nextDate, forwardOnly);
        const nextIsDateValid = !nextParsedDate.includes('invalid');

        date = nextDate;
        parsedDate = nextParsedDate;
        isDateValid = nextIsDateValid;

        if (nextIsDateValid) {
            pickedDate = nextParsedDate;
        }
    });

    function onDatePicked() {
        date = pickedDate;
    }

    // 'weekend' abbreviation omitted due to lack of space.
    const datePlaceholder = "Try 'Mon' or 'tm' then space";
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
    <div class="tasks-modal-parsed-date">
        {dateSymbol}<input
            class="tasks-modal-date-editor-picker"
            type="date"
            bind:value={pickedDate}
            id="date-editor-picker"
            on:input={onDatePicked}
            tabindex="-1"
        />
    </div>
{:else}
    <code class="tasks-modal-parsed-date">{dateSymbol} {@html parsedDate}</code>
{/if}

<style>
</style>
