<script lang="ts">
    import { TASK_FORMATS } from '../../src/Config/Settings';
    import ReminderEditor from '../../src/ui/ReminderEditor.svelte';

    let reminderTimeFromEditor: string = '';
    let parsedReminderTimeFromEditor: string = '';
    let isReminderTimeValid = true;
</script>

<ReminderEditor
    reminderSymbol={TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols.reminderTimeSymbol}
    bind:reminderTime={reminderTimeFromEditor}
    bind:isReminderTimeValid
    accesskey={null}
    bind:parsedReminderTime={parsedReminderTimeFromEditor}
/>
<input bind:value={reminderTimeFromEditor} id="reminderTimeFromEditor" />
<input bind:value={parsedReminderTimeFromEditor} id="parsedReminderTimeFromEditor" />
<input bind:value={isReminderTimeValid} id="isReminderTimeValidFromEditor" />

<style>
</style>
