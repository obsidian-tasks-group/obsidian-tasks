<script lang="ts">
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
    // let inputElement: HTMLInputElement;
    // let flatpickrInstance: any;
    //
    // const dispatch = createEventDispatcher();
    //
    // const iconCalendarDays = (node: HTMLElement) => {
    //     // For a more general implementation, see:
    //     // https://github.com/joethei/obsidian-rss/blob/b600e2ead2505d58aa3e4c7898795bbf58fa3cdc/src/view/IconComponent.svelte
    //     setIcon(node, 'calendar-days');
    // };

    $: {
        date = doAutocomplete(date);
        parsedDate = parseTypedDateForDisplayUsingFutureDate(id, date, forwardOnly);
        isDateValid = !parsedDate.includes('invalid');
    }

    // 'weekend' abbreviation omitted due to lack of space.
    const datePlaceholder = "Try 'Mon' or 'tm' then space";

    /**
     * A calendar date picker which is not tied to any particular date field.
     *
     * See also {@link promptForDate}
     */
    // function openDatePicker() {
    //     if (inputElement) {
    //         if (flatpickrInstance) {
    //             flatpickrInstance.destroy(); // Destroy any existing instance to avoid conflicts
    //         }
    //
    //         const options: Record<string, any> = {
    //             enableTime: false,
    //             dateFormat: 'Y-m-d',
    //             locale: {
    //                 firstDayOfWeek: 1,
    //             },
    //             onClose: (selectedDates: Date[]) => {
    //                 dispatch('close', { instance: flatpickrInstance }); // Notify parent about close
    //
    //                 if (selectedDates.length > 0) {
    //                     const selectedDate = selectedDates[0];
    //                     date = window.moment(selectedDate).format('YYYY-MM-DD');
    //                 }
    //
    //                 flatpickrInstance.destroy(); // Destroy the instance after the date is selected
    //                 flatpickrInstance = null;
    //             },
    //             allowInput: true, // Allow manual input to keep the field empty if no selection is made
    //             defaultDate: undefined, // Explicitly define defaultDate with undefined
    //         };
    //
    //         // We don't use parseDate() here as we want to strictly only match exact dates,
    //         // and not words like 'today' or 'tomorrow', to make sure we really
    //         // are using the already-parsed date in the Modal UI:
    //         const dateMatcher = /^\d{4}-\d{2}-\d{2}$/;
    //         if (parsedDate.match(dateMatcher)) {
    //             // This is where the user had typed, for example, 'tomorrow' in the input
    //             // field, and chrono has converted that to an exact date.
    //             options.defaultDate = new Date(parsedDate);
    //         } else if (date.match(dateMatcher)) {
    //             // This is a precaution, for the unlikely event that the input field
    //             // contains a parsed date, but the parsedDate does not.
    //             // It's possible that it is unreachable, but we would need tests to confirm that.
    //             options.defaultDate = new Date(date);
    //         }
    //
    //         flatpickrInstance = flatpickr(inputElement, options);
    //         dispatch('open', { instance: flatpickrInstance }); // Notify parent about open
    //
    //         flatpickrInstance.open(); // Directly open the date picker
    //     }
    // }
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

<!--<button-->
<!--    class="tasks-modal-calendar-button"-->
<!--    use:iconCalendarDays-->
<!--    on:click={openDatePicker}-->
<!--    aria-label="Open date picker"-->
<!--    style="background: none; border: none; padding: 0; cursor: pointer;"-->
<!--/>-->

<code class="tasks-modal-parsed-date">{dateSymbol} {@html parsedDate}</code>

<style>
</style>
