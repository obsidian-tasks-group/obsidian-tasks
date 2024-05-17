<script lang="ts">
    import { TASK_FORMATS } from '../Config/Settings';
    import { Recurrence } from '../Task/Recurrence';
    import type { EditableTask } from './EditableTask';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    export let editableTask: EditableTask;
    export let isRecurrenceValid: boolean;
    export let accesskey: string | null;

    let parsedRecurrence: string = '';

    function parseAndValidateRecurrence(editableTask: EditableTask) {
        isRecurrenceValid = true;
        if (!editableTask.recurrenceRule) {
            parsedRecurrence = '<i>not recurring</>';
            return;
        }

        const recurrenceFromText = Recurrence.fromText({
            recurrenceRuleText: editableTask.recurrenceRule,
            // Only for representation in the modal, no dates required.
            startDate: null,
            scheduledDate: null,
            dueDate: null,
        })?.toText();

        if (!recurrenceFromText) {
            parsedRecurrence = '<i>invalid recurrence rule</i>';
            isRecurrenceValid = false;
            return;
        }

        if (editableTask.startDate || editableTask.scheduledDate || editableTask.dueDate) {
            parsedRecurrence = recurrenceFromText;
            return;
        } else {
            parsedRecurrence = '<i>due, scheduled or start date required</i>';
            isRecurrenceValid = false;
            return;
        }
    }

    // NEW_TASK_FIELD_EDIT_REQUIRED
    $: {
        parseAndValidateRecurrence(editableTask);
    }

    const { recurrenceSymbol } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;
</script>

<label for="recurrence">{@html labelContentWithAccessKey('Recurs', accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={editableTask.recurrenceRule}
    id="recurrence"
    type="text"
    class:tasks-modal-error={!isRecurrenceValid}
    class="tasks-modal-date-input"
    placeholder="Try 'every day when done'"
    {accesskey}
/>
<code class="tasks-modal-parsed-date">{recurrenceSymbol} {@html parsedRecurrence}</code>
