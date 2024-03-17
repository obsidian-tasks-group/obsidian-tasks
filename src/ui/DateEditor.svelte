<script lang='ts'>
    import { doAutocomplete } from '../lib/DateAbbreviations';
    import { parseTypedDateForDisplayUsingFutureDate } from '../lib/DateTools';

    export let dateSymbol: string;
    export let date: string;
    export let parsedDate: string;
    export let isDateValid: boolean;
    export let forwardOnly: boolean;
    export let accesskey: string | null;
    export let placeholder: string;

    $: {
        date = doAutocomplete(date);
        parsedDate = parseTypedDateForDisplayUsingFutureDate('scheduled', date, forwardOnly);
        isDateValid = !parsedDate.includes('invalid');
    }
</script>

<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={date}
    id="scheduled"
    type="text"
    class:tasks-modal-error={!isDateValid}
    class="input"
    placeholder={placeholder}
    accesskey={accesskey}
/>
<code class="results">{dateSymbol} {@html parsedDate}</code>

<style>
</style>
