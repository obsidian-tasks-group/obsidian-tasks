<script lang="ts">
    import flatpickr from 'flatpickr'; // Import flatpickr directly
    import { doAutocomplete } from '../DateTime/DateAbbreviations';
    import { parseTypedDateForDisplayUsingFutureDate } from '../DateTime/DateTools';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    export let id: 'start' | 'scheduled' | 'due' | 'done' | 'created' | 'cancelled';
    export let dateSymbol: string;
    export let date: string;
    export let isDateValid: boolean;
    export let forwardOnly: boolean;
    export let accesskey: string | null;

    let parsedDate: string;
    let inputElement: HTMLInputElement;

    $: {
        date = doAutocomplete(date);
        parsedDate = parseTypedDateForDisplayUsingFutureDate(id, date, forwardOnly);
        isDateValid = !parsedDate.includes('invalid');
    }

    // 'weekend' abbreviation omitted due to lack of space.
    const datePlaceholder = "Try 'Mon' or 'tm' then space";

    // Function to open the date-picker and update the date
    function openDatePicker() {
        if (inputElement) {
            flatpickr(inputElement, {
                defaultDate: date ? new Date(date) : new Date(),
                enableTime: false,
                dateFormat: 'Y-m-d',
                locale: {
                    firstDayOfWeek: 1,
                },
                onClose: (selectedDates) => {
                    if (selectedDates.length > 0) {
                        const selectedDate = selectedDates[0];
                        const year = selectedDate.getFullYear();
                        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                        const day = String(selectedDate.getDate()).padStart(2, '0');
                        date = `${year}-${month}-${day}`;
                    }
                },
            }).open(); // Directly open the date picker
        }
    }
</script>

<label for={id}>{@html labelContentWithAccessKey(id, accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:this={inputElement}
    bind:value={date}
    {id}
    type="text"
    class:tasks-modal-error={!isDateValid}
    class="tasks-modal-date-input"
    placeholder={datePlaceholder}
    {accesskey}
/>

<!-- Add the calendar icon here and bind click event -->
<svg
    class="calendar-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24px"
    height="24px"
    on:click={openDatePicker}
>
    <path
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"
    />
</svg>

<code class="tasks-modal-parsed-date">{dateSymbol} {@html parsedDate}</code>

<style>
    /* Add some basic styling for the calendar icon */
    /* Commented out as it generates a main.css file at the root of the repo */
    /*.calendar-icon {*/
    /*    margin: 0 8px;*/
    /*    vertical-align: middle;*/
    /*}*/
</style>
