<script lang="ts">
    import { TASK_FORMATS } from '../Config/Settings';
    import type { EditableTask } from './EditableTask';
    import { labelContentWithAccessKey } from './EditTaskHelpers';
    import { i18n } from '../i18n/i18n';

    export let editableTask: EditableTask;
    export let isRecurrenceValid: boolean;
    export let accesskey: string | null;

    let parsedRecurrence: string;

    $: ({ parsedRecurrence, isRecurrenceValid } = editableTask.parseAndValidateRecurrence());

    const { recurrenceSymbol } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

    function translateRecurrenceText(text: string): string {
        if (text === 'every day') return i18n.t('modals.taskModal.everyDay');
        if (text === 'every day when done') return i18n.t('modals.taskModal.everyDayWhenDone');
        return text;
    }
</script>

<label for="recurrence">{@html labelContentWithAccessKey(i18n.t('modals.taskModal.recurs'), accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={editableTask.recurrenceRule}
    id="recurrence"
    type="text"
    class:tasks-modal-error={!isRecurrenceValid}
    class="tasks-modal-date-input"
    placeholder={i18n.t('modals.taskModal.tryEveryDayWhenDone')}
    {accesskey}
/>
<span class="tasks-modal-parsed-date">{recurrenceSymbol} {parsedRecurrence.startsWith('invalid') ? i18n.t('modals.taskModal.invalidRecurrenceRule') : (parsedRecurrence ? translateRecurrenceText(parsedRecurrence) : i18n.t('modals.taskModal.notRecurring'))}</span>
