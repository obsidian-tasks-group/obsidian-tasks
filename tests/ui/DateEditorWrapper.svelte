<script lang="ts">
    import { TASK_FORMATS } from '../../src/Config/Settings';
    import DateEditor from '../../src/ui/DateEditor.svelte';

    let dateFromDateEditor: string = '';
    let isDueDateValid = true;
</script>

<DateEditor
    id="due"
    dateSymbol={TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols.dueDateSymbol}
    bind:date={dateFromDateEditor}
    bind:isDateValid={isDueDateValid}
    forwardOnly={true}
    accesskey={null}
    on:open={() => {}}
    on:close={() => {}}
/>
<input bind:value={dateFromDateEditor} id="dueDateFromDateEditor" />

<style>
</style>
