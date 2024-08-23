<script lang="ts">
    import flatpickr from 'flatpickr';
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

    $: {
        date = doAutocomplete(date);
        parsedDate = parseTypedDateForDisplayUsingFutureDate(id, date, forwardOnly);
        isDateValid = !parsedDate.includes('invalid');
    }

    // 'weekend' abbreviation omitted due to lack of space.
    const datePlaceholder = "Try 'Mon' or 'tm' then space";

    // Function to handle the Escape key to only close the date picker
    function handleGlobalKeyDown(event: KeyboardEvent) {
        // TODO This line is reached for most keystrokes.
        //      But it is never reached if the user hits the Escape key!
        console.log(`In handleGlobalKeyDown: '${event.key}' ${JSON.stringify(event, null, 4)}`);
        if (event.key === 'Escape' && flatpickrInstance && flatpickrInstance.isOpen) {
            console.log('Escape key detected, closing flatpickr.');
            event.preventDefault(); // Prevent the default behavior
            event.stopPropagation(); // Stop the event from reaching the modal
            flatpickrInstance.close(); // Close the date picker
        }
    }

    // Function to open the date-picker and update the date
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
                    document.body.removeEventListener('keydown', handleGlobalKeyDown); // Remove listener when closed

                    if (selectedDates.length > 0) {
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

            if (date) {
                // TODO If the user had typed today, yesterday or similar, we need to get the date
                //      from parsedDate instead.
                options.defaultDate = new Date(date);
            }

            // TODO Prevent hitting the Escape key from closing both flatpickr and the parent widget,
            //      which would lose any of the user's earlier edits.
            flatpickrInstance = flatpickr(inputElement, options);

            // Things tried that have not worked (with changes made both on addEventListener and removeEventListener):
            //  - Pass in a 3rd argument, true - to trigger event at the capture phase
            //  - Use document.addEventListener() instead of document.body.addEventListener()
            // I have also tried it with global capture - true being passed in as the 3rd arg to
            // removeEventListener() and addEventListener() - it still didn't trigger on Escape.
            document.body.addEventListener('keydown', handleGlobalKeyDown); // Add global listener in capture phase when opened

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
    /* Add some basic styling for the calendar icon */
    /* Commented out as it generates a main.css file at the root of the repo */
    /*.calendar-icon {*/
    /*    margin: 0 8px;*/
    /*    vertical-align: middle;*/
    /*}*/
</style>
