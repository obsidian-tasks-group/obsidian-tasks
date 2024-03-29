<script lang="ts">
    import { onMount } from 'svelte';
    import { parseTypedDateForSaving } from '../lib/DateTools';
    import { Recurrence } from '../Task/Recurrence';
    import { TASK_FORMATS, getSettings } from '../Config/Settings';
    import { GlobalFilter } from '../Config/GlobalFilter';
    import { Status } from '../Statuses/Status';
    import { Task } from '../Task/Task';
    import { TasksDate } from '../Scripting/TasksDate';
    import { addDependencyToParent, ensureTaskHasId, generateUniqueId, removeDependency } from '../Task/TaskDependency';
    import { replaceTaskWithTasks } from '../Obsidian/File';
    import { Priority } from '../Task/Priority';
    import DateEditor from './DateEditor.svelte';
    import type { EditableTask } from './EditableTask';
    import Dependency from './Dependency.svelte';

    // These exported variables are passed in as props by TaskModal.onOpen():
    export let task: Task;
    export let onSubmit: (updatedTasks: Task[]) => void | Promise<void>;
    export let statusOptions: Status[];
    export let allTasks: Task[];

    let statusSymbol = task.status.symbol;

    const {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        prioritySymbols,
        recurrenceSymbol,
        startDateSymbol,
        scheduledDateSymbol,
        dueDateSymbol,
        cancelledDateSymbol,
        createdDateSymbol,
        doneDateSymbol,
    } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

    let descriptionInput: HTMLTextAreaElement;
    let editableTask: EditableTask = {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        description: '',
        status: Status.TODO,
        priority: 'none',
        recurrenceRule: '',
        createdDate: '',
        startDate: '',
        scheduledDate: '',
        dueDate: '',
        doneDate: '',
        cancelledDate: '',
        forwardOnly: true,
        blockedBy: [],
        blocking: [],
    };

    let isDescriptionValid: boolean = true;

    let isCancelledDateValid: boolean = true;
    let isCreatedDateValid: boolean = true;
    let isDoneDateValid: boolean = true;
    let isDueDateValid: boolean = true;
    let isScheduledDateValid: boolean = true;
    let isStartDateValid: boolean = true;

    let parsedRecurrence: string = '';
    let isRecurrenceValid: boolean = true;

    let addGlobalFilterOnSave: boolean = false;
    let withAccessKeys: boolean = true;
    let formIsValid: boolean = true;

    let originalBlocking: Task[] = [];

    let mountComplete = false;

    const priorityOptions: {
        value: typeof editableTask.priority;
        label: string;
        symbol: string;
        accessKey: string;
        accessKeyIndex: number;
    }[] = [
        {
            value: 'lowest',
            label: 'Lowest',
            symbol: prioritySymbols.Lowest,
            accessKey: 'o',
            accessKeyIndex: 1,
        },
        {
            value: 'low',
            label: 'Low',
            symbol: prioritySymbols.Low,
            accessKey: 'l',
            accessKeyIndex: 0,
        },
        {
            value: 'none',
            label: 'Normal',
            symbol: prioritySymbols.None,
            accessKey: 'n',
            accessKeyIndex: 0,
        },
        {
            value: 'medium',
            label: 'Medium',
            symbol: prioritySymbols.Medium,
            accessKey: 'm',
            accessKeyIndex: 0,
        },
        {
            value: 'high',
            label: 'High',
            symbol: prioritySymbols.High,
            accessKey: 'h',
            accessKeyIndex: 0,
        },
        {
            value: 'highest',
            label: 'Highest',
            symbol: prioritySymbols.Highest,
            accessKey: 'i',
            accessKeyIndex: 1,
        },
    ];

    async function serialiseTaskId(task: Task) {
        if (task.id !== '') return task;

        const tasksWithId = allTasks.filter((task) => task.id !== '');

        const updatedTask = ensureTaskHasId(
            task,
            tasksWithId.map((task) => task.id),
        );

        await replaceTaskWithTasks({ originalTask: task, newTasks: updatedTask });

        return updatedTask;
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
            // Update the doneDate field, in case changing the status changed the value:
            editableTask.doneDate = taskWithEditedStatusApplied.done.formatAsDate();
            editableTask.cancelledDate = taskWithEditedStatusApplied.cancelled.formatAsDate();
        }
    };

    $: accesskey = (key: string) => (withAccessKeys ? key : null);
    $: formIsValid =
        isDueDateValid &&
        isRecurrenceValid &&
        isScheduledDateValid &&
        isStartDateValid &&
        isDescriptionValid &&
        isCancelledDateValid &&
        isCreatedDateValid &&
        isDoneDateValid;
    $: isDescriptionValid = editableTask.description.trim() !== '';

    // NEW_TASK_FIELD_EDIT_REQUIRED
    $: {
        isRecurrenceValid = true;
        if (!editableTask.recurrenceRule) {
            parsedRecurrence = '<i>not recurring</>';
        } else {
            const recurrenceFromText = Recurrence.fromText({
                recurrenceRuleText: editableTask.recurrenceRule,
                // Only for representation in the modal, no dates required.
                startDate: null,
                scheduledDate: null,
                dueDate: null,
            })?.toText();
            if (!recurrenceFromText) {
                parsedRecurrence = '<i>invalid recurrence rule</i>';
                isRecurrenceValid = false;
            } else if (!editableTask.startDate && !editableTask.scheduledDate && !editableTask.dueDate) {
                parsedRecurrence = '<i>due, scheduled or start date required</i>';
                isRecurrenceValid = false;
            } else {
                parsedRecurrence = recurrenceFromText;
            }
        }
    }

    onMount(() => {
        const { provideAccessKeys } = getSettings();
        withAccessKeys = provideAccessKeys;
        const description = GlobalFilter.getInstance().removeAsWordFrom(task.description);
        // If we're displaying to the user the description without the global filter (i.e. it was removed in the method
        // above), or if the description did not include a global filter in the first place, we'll add the global filter
        // when saving the task.
        if (description != task.description || !GlobalFilter.getInstance().includedIn(task.description)) {
            addGlobalFilterOnSave = true;
        }
        let priority: typeof editableTask.priority = 'none';
        if (task.priority === Priority.Lowest) {
            priority = 'lowest';
        } else if (task.priority === Priority.Low) {
            priority = 'low';
        } else if (task.priority === Priority.Medium) {
            priority = 'medium';
        } else if (task.priority === Priority.High) {
            priority = 'high';
        } else if (task.priority === Priority.Highest) {
            priority = 'highest';
        }

        const blockedBy: Task[] = [];

        for (const taskId of task.dependsOn) {
            const depTask = allTasks.find((cacheTask) => cacheTask.id === taskId);

            if (!depTask) continue;

            blockedBy.push(depTask);
        }

        originalBlocking = allTasks.filter((cacheTask) => cacheTask.dependsOn.includes(task.id));

        editableTask = {
            // NEW_TASK_FIELD_EDIT_REQUIRED
            description,
            status: task.status,
            priority,
            recurrenceRule: task.recurrence ? task.recurrence.toText() : '',
            createdDate: new TasksDate(task.createdDate).formatAsDate(),
            startDate: new TasksDate(task.startDate).formatAsDate(),
            scheduledDate: new TasksDate(task.scheduledDate).formatAsDate(),
            dueDate: new TasksDate(task.dueDate).formatAsDate(),
            doneDate: new TasksDate(task.doneDate).formatAsDate(),
            cancelledDate: new TasksDate(task.cancelledDate).formatAsDate(),
            forwardOnly: true,
            blockedBy: blockedBy,
            blocking: originalBlocking,
        };

        mountComplete = true;

        setTimeout(() => {
            descriptionInput.focus();
        }, 10);
    });

    const _onPriorityKeyup = (event: KeyboardEvent) => {
        if (event.key && !event.altKey && !event.ctrlKey) {
            const priorityOption = priorityOptions.find((option) => option.label.charAt(0).toLowerCase() == event.key);
            if (priorityOption) {
                editableTask.priority = priorityOption.value;
            }
        }
    };

    const _onClose = () => {
        onSubmit([]);
    };

    const _onDescriptionKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (formIsValid) _onSubmit();
        }
    };

    // this is called, when text is pasted or dropped into
    // the description field, to remove any linebreaks
    const _removeLinebreaksFromDescription = () => {
        // wrapped into a timer to run after the paste/drop event
        setTimeout(() => {
            editableTask.description = editableTask.description.replace(/[\r\n]+/g, ' ');
        }, 0);
    };

    const _onSubmit = async () => {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        let description = editableTask.description.trim();
        if (addGlobalFilterOnSave) {
            description = GlobalFilter.getInstance().prependTo(description);
        }

        const startDate = parseTypedDateForSaving(editableTask.startDate, editableTask.forwardOnly);
        const scheduledDate = parseTypedDateForSaving(editableTask.scheduledDate, editableTask.forwardOnly);
        const dueDate = parseTypedDateForSaving(editableTask.dueDate, editableTask.forwardOnly);

        const cancelledDate = parseTypedDateForSaving(editableTask.cancelledDate, editableTask.forwardOnly);
        const createdDate = parseTypedDateForSaving(editableTask.createdDate, editableTask.forwardOnly);
        const doneDate = parseTypedDateForSaving(editableTask.doneDate, editableTask.forwardOnly);

        let recurrence: Recurrence | null = null;
        if (editableTask.recurrenceRule) {
            recurrence = Recurrence.fromText({
                recurrenceRuleText: editableTask.recurrenceRule,
                startDate,
                scheduledDate,
                dueDate,
            });
        }

        let parsedPriority: Priority;
        switch (editableTask.priority) {
            case 'lowest':
                parsedPriority = Priority.Lowest;
                break;
            case 'low':
                parsedPriority = Priority.Low;
                break;
            case 'medium':
                parsedPriority = Priority.Medium;
                break;
            case 'high':
                parsedPriority = Priority.High;
                break;
            case 'highest':
                parsedPriority = Priority.Highest;
                break;
            default:
                parsedPriority = Priority.None;
        }

        let blockedByWithIds = [];

        for (const depTask of editableTask.blockedBy) {
            const newDep = await serialiseTaskId(depTask);
            blockedByWithIds.push(newDep);
        }

        let id = task.id;
        let removedBlocking: Task[] = [];
        let addedBlocking: Task[] = [];

        if (editableTask.blocking.toString() !== originalBlocking.toString() || editableTask.blocking.length !== 0) {
            if (task.id === '') {
                id = generateUniqueId(allTasks.filter((task) => task.id !== '').map((task) => task.id));
            }

            removedBlocking = originalBlocking.filter((task) => !editableTask.blocking.includes(task));

            addedBlocking = editableTask.blocking.filter((task) => !originalBlocking.includes(task));
        }

        // First create an updated task, with all edits except Status:
        const updatedTask = new Task({
            // NEW_TASK_FIELD_EDIT_REQUIRED
            ...task,
            description,
            status: task.status,
            priority: parsedPriority,
            recurrence,
            startDate,
            scheduledDate,
            dueDate,
            doneDate,
            createdDate,
            cancelledDate,
            dependsOn: blockedByWithIds.map((task) => task.id),
            id,
        });

        for (const blocking of removedBlocking) {
            const newParent = removeDependency(blocking, updatedTask);
            await replaceTaskWithTasks({ originalTask: blocking, newTasks: newParent });
        }

        for (const blocking of addedBlocking) {
            const newParent = addDependencyToParent(blocking, updatedTask);
            await replaceTaskWithTasks({ originalTask: blocking, newTasks: newParent });
        }

        // Then apply the new status to the updated task, in case a new recurrence
        // needs to be created.
        // If there is a 'done' date, use that for today's date for recurrence calculations.
        // Otherwise, use the current date.
        const today = doneDate ? doneDate : window.moment();
        const newTasks = updatedTask.handleNewStatusWithRecurrenceInUsersOrder(editableTask.status, today);
        onSubmit(newTasks);
    };
</script>

<!--
Availability of access keys:
- A: Start
- B: Before this
- C:
- D: Due
- E: After this
- F: Only future dates
- G:
- H: High
- I: Highest
- J:
- K:
- L: Low
- M: Medium
- N: Normal
- O: Lowest
- P:
- Q:
- R: Recurs
- S: Scheduled
- T: Description
- U: Status
- V:
- W:
- X:
- Y:
- Z:
-->

<div class="tasks-modal">
    <form on:submit|preventDefault={_onSubmit} class:with-accesskeys={withAccessKeys}>
        <!-- NEW_TASK_FIELD_EDIT_REQUIRED -->

        <!-- --------------------------------------------------------------------------- -->
        <!--  Description  -->
        <!-- --------------------------------------------------------------------------- -->
        <div class="tasks-modal-section">
            <label for="description">Descrip<span class="accesskey">t</span>ion</label>
            <!-- svelte-ignore a11y-accesskey -->
            <textarea
                bind:value={editableTask.description}
                bind:this={descriptionInput}
                id="description"
                class="tasks-modal-description"
                placeholder="Take out the trash"
                accesskey={accesskey('t')}
                on:keydown={_onDescriptionKeyDown}
                on:paste={_removeLinebreaksFromDescription}
                on:drop={_removeLinebreaksFromDescription}
            />
        </div>

        <!-- --------------------------------------------------------------------------- -->
        <!--  Priority  -->
        <!-- --------------------------------------------------------------------------- -->
        <div class="tasks-modal-section tasks-modal-priorities" on:keyup={_onPriorityKeyup}>
            <label for="priority-{editableTask.priority}">Priority</label>
            {#each priorityOptions as { value, label, symbol, accessKey, accessKeyIndex }}
                <span>
                    <!-- svelte-ignore a11y-accesskey -->
                    <input
                        type="radio"
                        id="priority-{value}"
                        {value}
                        bind:group={editableTask.priority}
                        accesskey={accesskey(accessKey)}
                    />
                    <label for="priority-{value}">
                        <span>{label.substring(0, accessKeyIndex)}</span><span class="accesskey"
                            >{label.substring(accessKeyIndex, accessKeyIndex + 1)}</span
                        ><span>{label.substring(accessKeyIndex + 1)}</span>
                        {#if symbol && symbol.charCodeAt(0) >= 0x100}
                            <span>{symbol}</span>
                        {/if}
                    </label>
                </span>
            {/each}
        </div>

        <!-- --------------------------------------------------------------------------- -->
        <!--  Recurrence  -->
        <!-- --------------------------------------------------------------------------- -->
        <div class="tasks-modal-section tasks-modal-dates">
            <!-- --------------------------------------------------------------------------- -->
            <!--  Recurrence  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="recurrence" class="accesskey-first">Recurs</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.recurrenceRule}
                id="recurrence"
                type="text"
                class:tasks-modal-error={!isRecurrenceValid}
                class="input"
                placeholder="Try 'every 2 weeks on Thursday'."
                accesskey={accesskey('r')}
            />
            <code class="results">{recurrenceSymbol} {@html parsedRecurrence}</code>
        </div>

        <!-- --------------------------------------------------------------------------- -->
        <!--  Dates  -->
        <!-- --------------------------------------------------------------------------- -->
        <hr />
        <div class="tasks-modal-section tasks-modal-dates">
            <!-- --------------------------------------------------------------------------- -->
            <!--  Due Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="due" class="accesskey-first">Due</label>
            <DateEditor
                id="due"
                dateSymbol={dueDateSymbol}
                bind:date={editableTask.dueDate}
                bind:isDateValid={isDueDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={accesskey('d')}
            />

            <!-- --------------------------------------------------------------------------- -->
            <!--  Scheduled Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="scheduled" class="accesskey-first">Scheduled</label>
            <DateEditor
                id="scheduled"
                dateSymbol={scheduledDateSymbol}
                bind:date={editableTask.scheduledDate}
                bind:isDateValid={isScheduledDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={accesskey('s')}
            />

            <!-- --------------------------------------------------------------------------- -->
            <!--  Start Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="start">St<span class="accesskey">a</span>rt</label>
            <DateEditor
                id="start"
                dateSymbol={startDateSymbol}
                bind:date={editableTask.startDate}
                bind:isDateValid={isStartDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={accesskey('a')}
            />

            <!-- --------------------------------------------------------------------------- -->
            <!--  Only future dates  -->
            <!-- --------------------------------------------------------------------------- -->
            <div>
                <label for="forwardOnly"
                    >Only
                    <span class="accesskey-first">future</span> dates:</label
                >
                <!-- svelte-ignore a11y-accesskey -->
                <input
                    bind:checked={editableTask.forwardOnly}
                    id="forwardOnly"
                    type="checkbox"
                    class="input task-list-item-checkbox tasks-modal-checkbox"
                    accesskey={accesskey('f')}
                />
            </div>
        </div>

        <!-- --------------------------------------------------------------------------- -->
        <!--  Dependencies  -->
        <!-- --------------------------------------------------------------------------- -->
        <hr />
        <div class="tasks-modal-section tasks-modal-dates">
            {#if allTasks.length > 0 && mountComplete}
                <!-- --------------------------------------------------------------------------- -->
                <!--  Blocked By Tasks  -->
                <!-- --------------------------------------------------------------------------- -->
                <label for="blockedBy" class="accesskey-first">Before this</label>
                <Dependency
                    type="blockedBy"
                    {task}
                    {editableTask}
                    {allTasks}
                    {_onDescriptionKeyDown}
                    {accesskey}
                    accesskeyLetter="b"
                    placeholder="Search for tasks that the task being edited depends on..."
                />

                <!-- --------------------------------------------------------------------------- -->
                <!--  Blocking Tasks  -->
                <!-- --------------------------------------------------------------------------- -->
                <label for="blocking">Aft<span class="accesskey">e</span>r this</label>
                <Dependency
                    type="blocking"
                    {task}
                    {editableTask}
                    {allTasks}
                    {_onDescriptionKeyDown}
                    {accesskey}
                    accesskeyLetter="e"
                    placeholder="Search for tasks that depend on this task being done..."
                />
            {:else}
                <div><i>Blocking and blocked by fields are disabled when vault tasks is empty</i></div>
            {/if}
        </div>

        <!-- --------------------------------------------------------------------------- -->
        <!--  Status  -->
        <!-- --------------------------------------------------------------------------- -->
        <hr />
        <div class="tasks-modal-section">
            <label for="status">Stat<span class="accesskey">u</span>s</label>
            <!-- svelte-ignore a11y-accesskey -->
            <select
                bind:value={statusSymbol}
                on:change={_onStatusChange}
                id="status-type"
                class="dropdown"
                accesskey={accesskey('u')}
            >
                {#each statusOptions as status}
                    <option value={status.symbol}>{status.name} [{status.symbol}]</option>
                {/each}
            </select>
        </div>

        <div class="tasks-modal-section tasks-modal-dates">
            <!-- --------------------------------------------------------------------------- -->
            <!--  Created Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="created">Created</label>
            <DateEditor
                id="created"
                dateSymbol={createdDateSymbol}
                bind:date={editableTask.createdDate}
                bind:isDateValid={isCreatedDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={null}
            />

            <!-- --------------------------------------------------------------------------- -->
            <!--  Done Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="done">Done</label>
            <DateEditor
                id="done"
                dateSymbol={doneDateSymbol}
                bind:date={editableTask.doneDate}
                bind:isDateValid={isDoneDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={null}
            />

            <!-- --------------------------------------------------------------------------- -->
            <!--  Cancelled Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="cancelled">Cancelled</label>
            <DateEditor
                id="cancelled"
                dateSymbol={cancelledDateSymbol}
                bind:date={editableTask.cancelledDate}
                bind:isDateValid={isCancelledDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={null}
            />
        </div>

        <div class="tasks-modal-section tasks-modal-buttons">
            <button disabled={!formIsValid} type="submit" class="mod-cta">Apply </button>
            <button type="button" on:click={_onClose}>Cancel</button>
        </div>
    </form>
</div>
