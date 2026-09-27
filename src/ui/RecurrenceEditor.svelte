<script lang="ts">
    import { TASK_FORMATS } from '../Config/Settings';
    import type { EditableTask } from './EditableTask';
    import { labelContentWithAccessKey } from './EditTaskHelpers';
    import { TasksIcon, icon, useIconsForDisplay } from './Icons';

    export let editableTask: EditableTask;
    export let isRecurrenceValid: boolean;
    export let accesskey: string | null;

    let parsedRecurrence: string;

    $: ({ parsedRecurrence, isRecurrenceValid } = editableTask.parseAndValidateRecurrence());

    const { recurrenceSymbol } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;
    const useIcons = useIconsForDisplay();
</script>

<label for="recurrence">{@html labelContentWithAccessKey('Recurs', accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={editableTask.recurrenceRule}
    id="recurrence"
    type="text"
    class:tasks-modal-error={!isRecurrenceValid}
    class="tasks-modal-date-input"
    placeholder="e.g. every week"
    {accesskey}
/>
<span class="tasks-modal-parsed-date tasks-modal-parsed-message">
    {#if useIcons}
        {#if editableTask.recurrenceRule && isRecurrenceValid}
            <span use:icon={{ id: TasksIcon.recurrence, label: 'Recurs' }} />
        {/if}
    {:else}
        {recurrenceSymbol}
    {/if}
    {@html parsedRecurrence}
</span>
