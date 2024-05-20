<script lang="ts">
    import { doAutocomplete } from '../lib/DateAbbreviations';
    import { parseTypedDateForDisplayUsingFutureDate } from '../lib/DateTools';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    export let id: 'start' | 'scheduled' | 'due' | 'done' | 'created' | 'cancelled';
    export let dateSymbol: string;
    export let date: string;
    export let isDateValid: boolean;
    export let forwardOnly: boolean;
    export let accesskey: string | null;

    let parsedDate: string;
    $: {
        date = doAutocomplete(date);
        parsedDate = parseTypedDateForDisplayUsingFutureDate(id, date, forwardOnly);
        isDateValid = !parsedDate.includes('invalid');
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
<code class="tasks-modal-parsed-date">{dateSymbol} {@html parsedDate}</code>

<style>
</style>
