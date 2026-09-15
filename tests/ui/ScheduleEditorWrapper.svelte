<script lang="ts">
    import type { Moment } from 'moment';
    import { TASK_FORMATS } from '../../src/Config/Settings';
    import ScheduleEditor from '../../src/ui/ScheduleEditor.svelte';

    export let forwardOnly: boolean = false;
    export let originalScheduledDate: Moment | null = null;
    export let initialScheduledDate: string = '';
    export let initialReminderTime: string = '';

    let scheduledDateFromEditor: string = initialScheduledDate;
    let reminderTimeFromEditor: string = initialReminderTime;
    let isScheduleValidFromEditor = true;
</script>

<ScheduleEditor
    scheduledDateSymbol={TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols.scheduledDateSymbol}
    reminderTimeSymbol={TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols.reminderTimeSymbol}
    bind:scheduledDate={scheduledDateFromEditor}
    bind:reminderTime={reminderTimeFromEditor}
    bind:isScheduleValid={isScheduleValidFromEditor}
    {forwardOnly}
    {originalScheduledDate}
    accesskey={null}
/>
<input bind:value={scheduledDateFromEditor} id="scheduledDateFromEditor" />
<input bind:value={reminderTimeFromEditor} id="reminderTimeFromEditor" />
<input bind:value={isScheduleValidFromEditor} id="isScheduleValidFromEditor" />

<style>
</style>
