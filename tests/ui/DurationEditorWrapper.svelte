<script lang="ts">
    import DurationEditor from '../../src/ui/DurationEditor.svelte';
    import { EditableTask } from '../../src/ui/EditableTask';
    import { TaskBuilder } from '../TestingTools/TaskBuilder';

    export let initialDuration: string = '';

    const task = new TaskBuilder().build();
    const editableTask = EditableTask.fromTask(task, [task]);
    editableTask.duration = initialDuration;

    let isDurationValid = true;
</script>

<DurationEditor {editableTask} bind:isDurationValid />
<input bind:value={isDurationValid} id="isDurationValidFromDurationEditor" />
