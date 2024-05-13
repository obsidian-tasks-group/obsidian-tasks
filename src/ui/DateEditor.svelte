<script lang="ts">
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
    const datePlaceholder = "Try 'Mon' or 'tm' then space";

    function dateEditorLabelContent(id: string, accessKey: string | null) {
        if (accessKey === null) {
            return capitalizeFirstLetter(id);
        }

        if (!id.includes(accessKey)) {
            return `${capitalizeFirstLetter(id)} (<span class="accesskey">${accessKey}</span>)`;
        }

        const accessKeyIndex = id.indexOf(accessKey);
        let labelContent = id.substring(0, accessKeyIndex);
        labelContent += '<span class="accesskey">';

        if (accessKeyIndex === 0) {
            labelContent += id.substring(accessKeyIndex, accessKeyIndex + 1).toUpperCase();
        } else {
            labelContent += id.substring(accessKeyIndex, accessKeyIndex + 1);
        }

        labelContent += '</span>';
        labelContent += id.substring(accessKeyIndex + 1);
        labelContent = capitalizeFirstLetter(labelContent);
        return labelContent;
    }

    function capitalizeFirstLetter(id: string) {
        return id.charAt(0).toUpperCase() + id.slice(1);
    }
</script>

<label for={id}>{@html dateEditorLabelContent(id, accesskey)}</label>
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
