<script lang="ts">
    import { TASK_FORMATS } from '../../src/Config/Settings';
    import DateEditor from '../../src/ui/DateEditor.svelte';

    interface Props {
        forwardOnly: boolean;
    }

    let { forwardOnly }: Props = $props();

    let dateFromDateEditor = $state('');
    let parsedDateFromDateEditor = $state('');
    let isDueDateValid = $state(true);
</script>

<DateEditor
    id="due"
    dateSymbol={TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols.dueDateSymbol}
    bind:date={dateFromDateEditor}
    bind:isDateValid={isDueDateValid}
    {forwardOnly}
    accesskey={null}
    bind:parsedDate={parsedDateFromDateEditor}
/>
<input bind:value={dateFromDateEditor} id="dueDateFromDateEditor" />
<input bind:value={parsedDateFromDateEditor} id="parsedDateFromDateEditor" />
<input bind:value={isDueDateValid} id="parsedDateValidFromDateEditor" />

<style>
</style>
