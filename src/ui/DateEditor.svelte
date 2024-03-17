<script lang='ts'>
    import { doAutocomplete } from '../lib/DateAbbreviations';
    import { parseTypedDateForDisplayUsingFutureDate } from '../lib/DateTools';

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
    const datePlaceholder = "Try 'Monday' or 'tomorrow', or [td|tm|yd|tw|nw|we] then space.";
</script>

<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={date}
    id={id}
    type="text"
    class:tasks-modal-error={!isDateValid}
    class="input"
    placeholder={datePlaceholder}
    accesskey={accesskey}
/>
<code class="results">{dateSymbol} {@html parsedDate}</code>

<style>
</style>
