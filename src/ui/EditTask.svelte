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
    import { AppleSauceTask, type EditableTask } from './EditableTask';
    import Dependency from './Dependency.svelte';
    import { labelContentWithAccessKey } from './EditTaskHelpers';
    import RecurrenceEditor from './RecurrenceEditor.svelte';
    import StatusEditor from './StatusEditor.svelte';

    // These exported variables are passed in as props by TaskModal.onOpen():
    export let task: Task;
    export let onSubmit: (updatedTasks: Task[]) => void | Promise<void>;
    export let statusOptions: Status[];
    export let allTasks: Task[];

    const {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        prioritySymbols,
        startDateSymbol,
        scheduledDateSymbol,
        dueDateSymbol,
        cancelledDateSymbol,
        createdDateSymbol,
        doneDateSymbol,
    } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

    let descriptionInput: HTMLTextAreaElement;
    const editableTask: EditableTask = {
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

    let appleSauceTask = new AppleSauceTask(editableTask);

    let isDescriptionValid: boolean = true;

    let isCancelledDateValid: boolean = true;
    let isCreatedDateValid: boolean = true;
    let isDoneDateValid: boolean = true;
    let isDueDateValid: boolean = true;
    let isScheduledDateValid: boolean = true;
    let isStartDateValid: boolean = true;

    let isRecurrenceValid: boolean = true;

    let addGlobalFilterOnSave: boolean = false;
    let withAccessKeys: boolean = true;
    let formIsValid: boolean = true;

    let originalBlocking: Task[] = [];

    let mountComplete = false;

    const priorityOptions: {
        value: typeof appleSauceTask.priority;
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
    $: isDescriptionValid = appleSauceTask.description.trim() !== '';

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
        let priority: typeof appleSauceTask.priority = 'none';
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

        appleSauceTask = new AppleSauceTask({
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
        });

        mountComplete = true;

        setTimeout(() => {
            descriptionInput.focus();
        }, 10);
    });

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
            appleSauceTask.description = appleSauceTask.description.replace(/[\r\n]+/g, ' ');
        }, 0);
    };

    const _onSubmit = async () => {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        let description = appleSauceTask.description.trim();
        if (addGlobalFilterOnSave) {
            description = GlobalFilter.getInstance().prependTo(description);
        }

        const startDate = parseTypedDateForSaving(appleSauceTask.startDate, appleSauceTask.forwardOnly);
        const scheduledDate = parseTypedDateForSaving(appleSauceTask.scheduledDate, appleSauceTask.forwardOnly);
        const dueDate = parseTypedDateForSaving(appleSauceTask.dueDate, appleSauceTask.forwardOnly);

        const cancelledDate = parseTypedDateForSaving(appleSauceTask.cancelledDate, appleSauceTask.forwardOnly);
        const createdDate = parseTypedDateForSaving(appleSauceTask.createdDate, appleSauceTask.forwardOnly);
        const doneDate = parseTypedDateForSaving(appleSauceTask.doneDate, appleSauceTask.forwardOnly);

        let recurrence: Recurrence | null = null;
        if (appleSauceTask.recurrenceRule) {
            recurrence = Recurrence.fromText({
                recurrenceRuleText: appleSauceTask.recurrenceRule,
                startDate,
                scheduledDate,
                dueDate,
            });
        }

        let parsedPriority: Priority;
        switch (appleSauceTask.priority) {
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

        for (const depTask of appleSauceTask.blockedBy) {
            const newDep = await serialiseTaskId(depTask);
            blockedByWithIds.push(newDep);
        }

        let id = task.id;
        let removedBlocking: Task[] = [];
        let addedBlocking: Task[] = [];

        if (
            appleSauceTask.blocking.toString() !== originalBlocking.toString() ||
            appleSauceTask.blocking.length !== 0
        ) {
            if (task.id === '') {
                id = generateUniqueId(allTasks.filter((task) => task.id !== '').map((task) => task.id));
            }

            removedBlocking = originalBlocking.filter((task) => !appleSauceTask.blocking.includes(task));

            addedBlocking = appleSauceTask.blocking.filter((task) => !originalBlocking.includes(task));
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
        const newTasks = updatedTask.handleNewStatusWithRecurrenceInUsersOrder(appleSauceTask.status, today);
        onSubmit(newTasks);
    };
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
        <label for="description">{@html labelContentWithAccessKey('Description', accesskey('t'))}</label>
        <!-- svelte-ignore a11y-accesskey -->
        <textarea
            bind:value={appleSauceTask.description}
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
    <section class="tasks-modal-priority-section">
        <label for="priority-{appleSauceTask.priority}">Priority</label>
        {#each priorityOptions as { value, label, symbol, accessKey, accessKeyIndex }}
            <div class="task-modal-priority-option-container">
                <!-- svelte-ignore a11y-accesskey -->
                <input
                    type="radio"
                    id="priority-{value}"
                    {value}
                    bind:group={appleSauceTask.priority}
                    accesskey={accesskey(accessKey)}
                />
                <label for="priority-{value}">
                    <!-- These is no need to extract this behaviour to something like labelContentWithAccessKey(),
                    since this whole section will just go in a separate Svelte component and
                    will not be reused elsewhere like labelContentWithAccessKey(). -->
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
        <RecurrenceEditor editableTask={appleSauceTask} bind:isRecurrenceValid accesskey={accesskey('r')} />
        <!-- --------------------------------------------------------------------------- -->
        <!--  Due Date  -->
        <!-- --------------------------------------------------------------------------- -->
        <DateEditor
            id="due"
            dateSymbol={dueDateSymbol}
            bind:date={appleSauceTask.dueDate}
            bind:isDateValid={isDueDateValid}
            forwardOnly={appleSauceTask.forwardOnly}
            accesskey={accesskey('d')}
        />

        <!-- --------------------------------------------------------------------------- -->
        <!--  Scheduled Date  -->
        <!-- --------------------------------------------------------------------------- -->
        <DateEditor
            id="scheduled"
            dateSymbol={scheduledDateSymbol}
            bind:date={appleSauceTask.scheduledDate}
            bind:isDateValid={isScheduledDateValid}
            forwardOnly={appleSauceTask.forwardOnly}
            accesskey={accesskey('s')}
        />

        <!-- --------------------------------------------------------------------------- -->
        <!--  Start Date  -->
        <!-- --------------------------------------------------------------------------- -->
        <DateEditor
            id="start"
            dateSymbol={startDateSymbol}
            bind:date={appleSauceTask.startDate}
            bind:isDateValid={isStartDateValid}
            forwardOnly={appleSauceTask.forwardOnly}
            accesskey={accesskey('a')}
        />

        <!-- --------------------------------------------------------------------------- -->
        <!--  Only future dates  -->
        <!-- --------------------------------------------------------------------------- -->
        <div class="future-dates-only">
            <label for="forwardOnly">{@html labelContentWithAccessKey('Only future dates:', accesskey('f'))}</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:checked={appleSauceTask.forwardOnly}
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
            <Dependency
                type="blockedBy"
                labelText="Before this"
                {task}
                editableTask={appleSauceTask}
                {allTasks}
                {_onDescriptionKeyDown}
                accesskey={accesskey('b')}
                placeholder="Search for tasks that the task being edited depends on..."
            />

            <!-- --------------------------------------------------------------------------- -->
            <!--  Blocking Tasks  -->
            <!-- --------------------------------------------------------------------------- -->
            <Dependency
                type="blocking"
                labelText="After this"
                {task}
                editableTask={appleSauceTask}
                {allTasks}
                {_onDescriptionKeyDown}
                accesskey={accesskey('e')}
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
        <StatusEditor {task} bind:editableTask={appleSauceTask} {statusOptions} accesskey={accesskey('u')} />

        <!-- --------------------------------------------------------------------------- -->
        <!--  Created Date  -->
        <!-- --------------------------------------------------------------------------- -->
        <DateEditor
            id="created"
            dateSymbol={createdDateSymbol}
            bind:date={appleSauceTask.createdDate}
            bind:isDateValid={isCreatedDateValid}
            forwardOnly={appleSauceTask.forwardOnly}
            accesskey={accesskey('c')}
        />

        <!-- --------------------------------------------------------------------------- -->
        <!--  Done Date  -->
        <!-- --------------------------------------------------------------------------- -->
        <DateEditor
            id="done"
            dateSymbol={doneDateSymbol}
            bind:date={appleSauceTask.doneDate}
            bind:isDateValid={isDoneDateValid}
            forwardOnly={appleSauceTask.forwardOnly}
            accesskey={accesskey('x')}
        />

        <!-- --------------------------------------------------------------------------- -->
        <!--  Cancelled Date  -->
        <!-- --------------------------------------------------------------------------- -->
        <DateEditor
            id="cancelled"
            dateSymbol={cancelledDateSymbol}
            bind:date={appleSauceTask.cancelledDate}
            bind:isDateValid={isCancelledDateValid}
            forwardOnly={appleSauceTask.forwardOnly}
            accesskey={accesskey('-')}
        />
    </section>

    <section class="tasks-modal-button-section">
        <button disabled={!formIsValid} type="submit" class="mod-cta">Apply </button>
        <button type="button" on:click={_onClose}>Cancel</button>
    </section>
</form>
