<script lang="ts">
    import type { Status } from '../Statuses/Status';
    import type { Task } from '../Task/Task';
    import type { EditableTask } from './EditableTask';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    export let task: Task;
    export let editableTask: EditableTask;
    export let statusOptions: Status[];
    export let accesskey: string | null;

    let statusSymbol = task.status.symbol;

    /**
     * Set the done or cancelled date field of the editable task.
     * These fields are connected with the status.
     *
     * The date should be set in either of 2 cases:
     * - the date field is empty and the status was set (set the date from the task with the applied status)
     * - the date field is not empty but another status was set (clean the date field)
     *
     * @param editableTaskDateField
     * @param isInStatus
     * @param taskWithEditedStatusApplied
     * @param taskDateField
     */
    function setStatusRelatedDate(
        editableTaskDateField: keyof Pick<EditableTask, 'doneDate' | 'cancelledDate'>,
        isInStatus: boolean,
        taskWithEditedStatusApplied: Task,
        taskDateField: keyof Pick<Task, 'done' | 'cancelled'>,
    ) {
        const dateFieldIsEmpty = editableTask[editableTaskDateField] === '';

        if (dateFieldIsEmpty && isInStatus) {
            editableTask[editableTaskDateField] = taskWithEditedStatusApplied[taskDateField].formatAsDate();
        }

        if (!dateFieldIsEmpty && !isInStatus) {
            editableTask[editableTaskDateField] = '';
        }
    }

    const _onStatusChange = () => {
        // Use statusSymbol to find the status to save to editableTask.status
        const selectedStatus: Status | undefined = statusOptions.find((s) => s.symbol === statusSymbol);
        if (selectedStatus) {
            editableTask.status = selectedStatus;
        } else {
            console.log(`Error in EditTask: cannot find status with symbol ${statusSymbol}`);
            return;
        }

        // Obtain a temporary task with the new status applied, to see what would
        // happen to the done date:
        const taskWithEditedStatusApplied = task.handleNewStatus(selectedStatus).pop();

        if (taskWithEditedStatusApplied) {
            setStatusRelatedDate('doneDate', selectedStatus.isCompleted(), taskWithEditedStatusApplied, 'done');
            if ((editableTask.cancelledDate === '') === selectedStatus.isCancelled()) {
                editableTask.cancelledDate = taskWithEditedStatusApplied.cancelled.formatAsDate();
            }
        }
    };
</script>

<label for="status">{@html labelContentWithAccessKey('Status', accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<select
    bind:value={statusSymbol}
    on:change={_onStatusChange}
    id="status-type"
    class="status-editor-status-selector"
    {accesskey}
>
    {#each statusOptions as status}
        <option value={status.symbol}>{status.name} [{status.symbol}]</option>
    {/each}
</select>
