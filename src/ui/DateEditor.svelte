<script lang="ts">
    import flatpickr from 'flatpickr';
    import { createEventDispatcher } from 'svelte';

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
    let flatpickrInstance: any;

    const dispatch = createEventDispatcher();

    $: {
        date = doAutocomplete(date);
        parsedDate = parseTypedDateForDisplayUsingFutureDate(id, date, forwardOnly);
        isDateValid = !parsedDate.includes('invalid');
    }

    // 'weekend' abbreviation omitted due to lack of space.
    const datePlaceholder = "Try 'Mon' or 'tm' then space";

    // Function to open the date-picker and update the date
    // TODO Reduce its complexity.
    // TODO Can a function be extracted?
    // TODO Can the function be moved out?
    // TODO Can we re-use this in the pre-existing date picker function?
    function openDatePicker() {
        if (inputElement) {
            if (flatpickrInstance) {
                flatpickrInstance.destroy(); // Destroy any existing instance to avoid conflicts
            }

            const options: Record<string, any> = {
                enableTime: false,
                dateFormat: 'Y-m-d',
                locale: {
                    firstDayOfWeek: 1,
                },
                onClose: (selectedDates: Date[]) => {
                    dispatch('close', { instance: flatpickrInstance }); // Notify parent about close

                    if (selectedDates.length > 0) {
                        // TODO can this be simplified?
                        const selectedDate = selectedDates[0];
                        const year = selectedDate.getFullYear();
                        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                        const day = String(selectedDate.getDate()).padStart(2, '0');
                        date = `${year}-${month}-${day}`;
                    }

                    flatpickrInstance.destroy(); // Destroy the instance after the date is selected
                    flatpickrInstance = null;
                },
                allowInput: true, // Allow manual input to keep the field empty if no selection is made
                defaultDate: undefined, // Explicitly define defaultDate with undefined
            };

            // Determine if `parsedDate` should be used as the default date
            // TODO Remove repetition of regex here - do we have a helper function for this already?
            if (parsedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                options.defaultDate = new Date(parsedDate);
            } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                options.defaultDate = new Date(date);
            }

            flatpickrInstance = flatpickr(inputElement, options);
            dispatch('open', { instance: flatpickrInstance }); // Notify parent about open

            flatpickrInstance.open(); // Directly open the date picker
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

<!-- Separate the calendar icon from the input to allow typing in the input box -->
<!-- TODO Suppress or fix the ally warning-->
<!-- TODO Nicer looking icon, or at least make it a paler shade -->
<svg
    class="calendar-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24px"
    height="24px"
    on:click={openDatePicker}
    style="cursor: pointer;"
>
    <path
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"
    />
</svg>

<code class="tasks-modal-parsed-date">{dateSymbol} {@html parsedDate}</code>

<style>
</style>
