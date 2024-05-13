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

    function generateDateEditorLabel(id: string, withAccessKey: boolean, accessKey: string): string {
        let labelContent = capitalizeFirstLetter(id);
        if (withAccessKey) {
            if (!id.includes(accessKey)) {
                labelContent += ` (<span class="accesskey">${accessKey}</span>)`;
            } else {
                const accessKeyIndex = id.indexOf(accessKey);
                labelContent = id.substring(0, accessKeyIndex);
                labelContent += `<span class="accesskey">${id
                    .substring(accessKeyIndex, accessKeyIndex + 1)
                    .toUpperCase()}</span>`;
                labelContent += id.substring(accessKeyIndex + 1);
                labelContent = capitalizeFirstLetter(labelContent);
            }
        }

        return `<label for=${id}>${labelContent}</label>`;
    }

    function capitalizeFirstLetter(id: string) {
        return id.charAt(0).toUpperCase() + id.slice(1);
    }
</script>

<!--
Availability of access keys:
- A: Start
- B: Before this
- C: Created
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
- X: Done
- Y:
- Z:
- -: Cancelled
-->

<form class="tasks-modal" on:submit|preventDefault={_onSubmit}>
    <!-- NEW_TASK_FIELD_EDIT_REQUIRED -->

    <!-- --------------------------------------------------------------------------- -->
    <!--  Description  -->
    <!-- --------------------------------------------------------------------------- -->
    <section class="tasks-modal-description-section">
        {#if withAccessKeys}
            <label for="description">Descrip<span class="accesskey">t</span>ion</label>
        {:else}
            <label for="description">Description</label>
        {/if}
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
    </section>

    <!-- --------------------------------------------------------------------------- -->
    <!--  Priority  -->
    <!-- --------------------------------------------------------------------------- -->
    <section class="tasks-modal-priority-section" on:keyup={_onPriorityKeyup}>
        <label for="priority-{editableTask.priority}">Priority</label>
        {#each priorityOptions as { value, label, symbol, accessKey, accessKeyIndex }}
            <div class="task-modal-priority-option-container">
                <!-- svelte-ignore a11y-accesskey -->
                <input
                    type="radio"
                    id="priority-{value}"
                    {value}
                    bind:group={editableTask.priority}
                    accesskey={accesskey(accessKey)}
                />
                <label for="priority-{value}">
                    {#if withAccessKeys}
                        <span>{label.substring(0, accessKeyIndex)}</span><span class="accesskey"
                            >{label.substring(accessKeyIndex, accessKeyIndex + 1)}</span
                        ><span>{label.substring(accessKeyIndex + 1)}</span>
                    {:else}
                        <span>{label}</span>
                    {/if}
                    {#if symbol && symbol.charCodeAt(0) >= 0x100}
                        <span>{symbol}</span>
                    {/if}
                </label>
            </div>
        {/each}
    </section>

    <!-- --------------------------------------------------------------------------- -->
    <!--  Dates  -->
    <!-- --------------------------------------------------------------------------- -->
    <hr />
    <section class="tasks-modal-dates-section">
        <!-- --------------------------------------------------------------------------- -->
        <!--  Recurrence  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if withAccessKeys}
            <label for="recurrence"><span class="accesskey">R</span>ecurs</label>
        {:else}
            <label for="recurrence">Recurs</label>
        {/if}
        <!-- svelte-ignore a11y-accesskey -->
        <input
            bind:value={editableTask.recurrenceRule}
            id="recurrence"
            type="text"
            class:tasks-modal-error={!isRecurrenceValid}
            class="tasks-modal-date-input"
            placeholder="Try 'every day when done'"
            accesskey={accesskey('r')}
        />
        <code class="tasks-modal-parsed-date">{recurrenceSymbol} {@html parsedRecurrence}</code>
        <!-- --------------------------------------------------------------------------- -->
        <!--  Due Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if withAccessKeys}
            <label for="due"><span class="accesskey">D</span>ue</label>
        {:else}
            <label for="due">Due</label>
        {/if}
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
        {#if withAccessKeys}
            <label for="scheduled"><span class="accesskey">S</span>cheduled</label>
        {:else}
            <label for="scheduled">Scheduled</label>
        {/if}
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
        {#if withAccessKeys}
            <label for="start">St<span class="accesskey">a</span>rt</label>
        {:else}
            <label for="start">Start</label>
        {/if}
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
        <div class="future-dates-only">
            {#if withAccessKeys}
                <label for="forwardOnly"
                    >Only
                    <span class="accesskey">f</span>uture dates:</label
                >
            {:else}
                <label for="forwardOnly">Only future dates:</label>
            {/if}
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:checked={editableTask.forwardOnly}
                id="forwardOnly"
                type="checkbox"
                class="task-list-item-checkbox tasks-modal-checkbox"
                accesskey={accesskey('f')}
            />
        </div>
    </section>

    <!-- --------------------------------------------------------------------------- -->
    <!--  Dependencies  -->
    <!-- --------------------------------------------------------------------------- -->
    <hr />
    <section class="tasks-modal-dependencies-section">
        {#if allTasks.length > 0 && mountComplete}
            <!-- --------------------------------------------------------------------------- -->
            <!--  Blocked By Tasks  -->
            <!-- --------------------------------------------------------------------------- -->
            {#if withAccessKeys}
                <label for="blockedBy"><span class="accesskey">B</span>efore this</label>
            {:else}
                <label for="blockedBy">Before this</label>
            {/if}
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
            {#if withAccessKeys}
                <label for="blocking">Aft<span class="accesskey">e</span>r this</label>
            {:else}
                <label for="blocking">After this</label>
            {/if}
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
    </section>

    <hr />
    <section class="tasks-modal-dates-section">
        <!-- --------------------------------------------------------------------------- -->
        <!--  Status  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if withAccessKeys}
            <label for="status">Stat<span class="accesskey">u</span>s</label>
        {:else}
            <label for="status">Status</label>
        {/if}
        <!-- svelte-ignore a11y-accesskey -->
        <select
            bind:value={statusSymbol}
            on:change={_onStatusChange}
            id="status-type"
            class="tasks-modal-status-selector"
            accesskey={accesskey('u')}
        >
            {#each statusOptions as status}
                <option value={status.symbol}>{status.name} [{status.symbol}]</option>
            {/each}
        </select>

        <!-- --------------------------------------------------------------------------- -->
        <!--  Created Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {@html generateDateEditorLabel('created', withAccessKeys, 'c')}
        <DateEditor
            id="created"
            dateSymbol={createdDateSymbol}
            bind:date={editableTask.createdDate}
            bind:isDateValid={isCreatedDateValid}
            forwardOnly={editableTask.forwardOnly}
            accesskey={accesskey('c')}
        />

        <!-- --------------------------------------------------------------------------- -->
        <!--  Done Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if withAccessKeys}
            <label for="done">Done (<span class="accesskey">x</span>)</label>
        {:else}
            <label for="done">Done</label>
        {/if}
        <DateEditor
            id="done"
            dateSymbol={doneDateSymbol}
            bind:date={editableTask.doneDate}
            bind:isDateValid={isDoneDateValid}
            forwardOnly={editableTask.forwardOnly}
            accesskey={accesskey('x')}
        />

        <!-- --------------------------------------------------------------------------- -->
        <!--  Cancelled Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {@html generateDateEditorLabel('cancelled', withAccessKeys, '-')}
        <DateEditor
            id="cancelled"
            dateSymbol={cancelledDateSymbol}
            bind:date={editableTask.cancelledDate}
            bind:isDateValid={isCancelledDateValid}
            forwardOnly={editableTask.forwardOnly}
            accesskey={accesskey('-')}
        />
    </section>

    <section class="tasks-modal-button-section">
        <button disabled={!formIsValid} type="submit" class="mod-cta">Apply </button>
        <button type="button" on:click={_onClose}>Cancel</button>
    </section>
</form>
