<script lang="ts">
    import type { TasksDate } from '../DateTime/TasksDate';
    import { Status } from '../Statuses/Status';
    import type { Task } from '../Task/Task';
    import type { EditableTask } from './EditableTask';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    export let task: Task;
    export let editableTask: EditableTask;
    export let statusOptions: Status[];
    export let accesskey: string | null;

    let jsonStatus = JSON.stringify(task.status);

    function setStatusRelatedDate(currentValue: string, isInStatus: boolean, editedValue: TasksDate) {
        const dateFieldIsEmpty = currentValue === '';

        if (isInStatus && dateFieldIsEmpty) {
            // the date field is empty and the status was set (set the date from the task with the applied status)
            return editedValue.formatAsDate();
        }

        if (!isInStatus && !dateFieldIsEmpty) {
            // the date field is not empty but another status was set (clean the date field)
            return '';
        }

        return currentValue;
    }

    const _onStatusChange = () => {
        const newStatus = new Status(JSON.parse(jsonStatus).configuration);

        const selectedStatus = newStatus;
        editableTask.status = selectedStatus;

        // Obtain a temporary task with the new status applied, to see what would
        // happen to the done date:
        const taskWithEditedStatusApplied = task.handleNewStatus(selectedStatus).pop();

        if (taskWithEditedStatusApplied) {
            editableTask.doneDate = setStatusRelatedDate(
                editableTask.doneDate,
                selectedStatus.isCompleted(),
                taskWithEditedStatusApplied.done,
            );

            editableTask.cancelledDate = setStatusRelatedDate(
                editableTask.cancelledDate,
                selectedStatus.isCancelled(),
                taskWithEditedStatusApplied.cancelled,
            );
        }
    };
</script>

<label for="status">{@html labelContentWithAccessKey('Status', accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<select
    bind:value={jsonStatus}
    on:change={_onStatusChange}
    id="status-type"
    class="status-editor-status-selector"
    {accesskey}
>
    {#each statusOptions as status}
        <option value={JSON.stringify(status)}>{status.name} [{status.symbol}]</option>
    {/each}
</select>
