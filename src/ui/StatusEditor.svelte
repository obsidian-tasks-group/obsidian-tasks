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
            // change the done date using XNOR logic:
            //  done date is empty and new status is DONE
            // OR
            //  done date is filled and new status is not DONE
            if ((editableTask.doneDate === '') === selectedStatus.isCompleted()) {
                editableTask.doneDate = taskWithEditedStatusApplied['done'].formatAsDate();
            }

            // same logic for cancelled date & CANCELLED status
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
