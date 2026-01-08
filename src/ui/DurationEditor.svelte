<script lang="ts">
    import { TASK_FORMATS } from '../Config/Settings';
    import type { EditableTask } from './EditableTask';

    export let editableTask: EditableTask;
    export let isDurationValid: boolean;

    let parsedDuration: string;

    $: ({ parsedDuration, isDurationValid } = editableTask.parseAndValidateDuration());

    const { durationSymbol } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;
</script>

<label for="duration" />
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:value={editableTask.duration}
    id="duration"
    type="text"
    class:tasks-modal-error={!isDurationValid}
    class="tasks-modal-duration-input"
    placeholder="Try '1h30m'"
/>
<code class="tasks-modal-parsed-duration">{durationSymbol} {@html parsedDuration}</code>
