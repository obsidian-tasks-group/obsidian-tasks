<script lang="ts">
    import { doAutocomplete } from '../DateTime/DateAbbreviations';
    import { parseTypedDateForDisplayUsingFutureDate } from '../DateTime/DateTools';
    import { labelContentWithAccessKey } from './EditTaskHelpers';
    import { i18n } from '../i18n/i18n';

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
    const datePlaceholder = i18n.t('modals.taskModal.tryMonOrTm');

    $: invalidKey = (() => {
        if (parsedDate.startsWith('invalid')) {
            if (id === 'due') return 'invalidDueDate';
            if (id === 'scheduled') return 'invalidScheduledDate';
            if (id === 'start') return 'invalidStartDate';
            if (id === 'created') return 'invalidCreatedDate';
            if (id === 'done') return 'invalidDoneDate';
            if (id === 'cancelled') return 'invalidCancelledDate';
        }
        return null;
    })();
</script>

<label for={id}>{@html labelContentWithAccessKey(i18n.t('modals.taskModal.' + id), accesskey)}</label>
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
    <span class="tasks-modal-parsed-date">{dateSymbol} {invalidKey ? i18n.t('modals.taskModal.' + invalidKey) : parsedDate}</span>
{/if}

<style>
</style>
