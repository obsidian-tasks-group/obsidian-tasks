<script lang="ts">
    import { TASK_FORMATS } from '../Config/Settings';
    import type { EditableTask } from './EditableTask';

    export let editableTask: EditableTask;
    export let isDurationValid: boolean;

    let parsedDuration: string;

    $: ({ parsedDuration, isDurationValid } = editableTask.parseAndValidateDuration());

    const { durationSymbol } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;
</script>

<label for="duration">Duration</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={editableTask.duration}
    id="duration"
    type="text"
    class:tasks-modal-error={!isDurationValid}
    class="tasks-modal-date-input"
    placeholder="e.g. 1h30m, 2h, 45m"
/>
<code class="tasks-modal-parsed-date">{durationSymbol} {@html parsedDuration}</code>
