<script lang="ts">
    import { TASK_FORMATS } from '../Config/Settings';
    import { parseAndValidateEditableTaskRecurrence } from './EditableTask';
    import type { EditableTaskData } from './EditableTask';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    interface Props {
        editableTask: EditableTaskData;
        isRecurrenceValid: boolean;
        accesskey: string | null;
    }

    let { editableTask = $bindable(), isRecurrenceValid = $bindable(true), accesskey }: Props = $props();

    let recurrenceValidation = $derived(parseAndValidateEditableTaskRecurrence(editableTask));
    let parsedRecurrence = $derived(recurrenceValidation.parsedRecurrence);

    $effect(() => {
        isRecurrenceValid = recurrenceValidation.isRecurrenceValid;
    });

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
