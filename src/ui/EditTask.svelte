<script lang="ts">
    import * as chrono from 'chrono-node';
    import { onMount } from 'svelte';
    import { Recurrence } from '../Task/Recurrence';
    import { getSettings, TASK_FORMATS } from '../Config/Settings';
    import { GlobalFilter } from '../Config/GlobalFilter';
    import { Status } from '../Statuses/Status';
    import { Task } from '../Task/Task';
    import { doAutocomplete } from '../lib/DateAbbreviations';
    import { TasksDate } from '../Scripting/TasksDate';
    import { addDependencyToParent, ensureTaskHasId, generateUniqueId, removeDependency } from "../Task/TaskDependency";
    import { replaceTaskWithTasks } from "../Obsidian/File";
    import type { EditableTask } from "./EditableTask";
    import Dependency from "./Dependency.svelte";
    import { Priority } from '../Task/Priority';

    // These exported variables are passed in as props by TaskModal.onOpen():
    export let task: Task;
    export let onSubmit: (updatedTasks: Task[]) => void | Promise<void>;
    export let statusOptions: Status[];
    export let allTasks: Task[];

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
        blocking: []
    };

    let isDescriptionValid: boolean = true;

    let parsedCreatedDate: string = '';
    let isCreatedDateValid: boolean = true;

    let parsedStartDate: string = '';
    let isStartDateValid: boolean = true;

    let parsedScheduledDate: string = '';
    let isScheduledDateValid: boolean = true;

    let parsedDueDate: string = '';
    let isDueDateValid: boolean = true;

    let parsedRecurrence: string = '';
    let isRecurrenceValid: boolean = true;

    let parsedDoneDate: string = '';
    let isDoneDateValid: boolean = true;

    let parsedCancelledDate: string = '';
    let isCancelledDateValid: boolean = true;

    let addGlobalFilterOnSave: boolean = false;
    let withAccessKeys: boolean = true;
    let formIsValid: boolean = true;

    let originalBlocking: Task[] = [];

    let mountComplete = false;

    // 'weekend' abbreviation omitted due to lack of space.
    let datePlaceholder =
        "Try 'Monday' or 'tomorrow', or [td|tm|yd|tw|nw|we] then space.";

    const priorityOptions: {
            value: typeof editableTask.priority,
            label: string,
            symbol: string,
            accessKey: string,
            accessKeyIndex: number}[] =
        [{
            value: 'lowest',
            label: 'Lowest',
            symbol: prioritySymbols.Lowest,
            accessKey: 'o',
            accessKeyIndex: 1
        }, {
            value: 'low',
            label: 'Low',
            symbol: prioritySymbols.Low,
            accessKey: 'l',
            accessKeyIndex: 0
        }, {
            value: 'none',
            label: 'Normal',
            symbol: prioritySymbols.None,
            accessKey: 'n',
            accessKeyIndex: 0
        }, {
            value: 'medium',
            label: 'Medium',
            symbol: prioritySymbols.Medium,
            accessKey: 'm',
            accessKeyIndex: 0
        }, {
            value: 'high',
            label: 'High',
            symbol: prioritySymbols.High,
            accessKey: 'h',
            accessKeyIndex: 0
        }, {
            value: 'highest',
            label: 'Highest',
            symbol: prioritySymbols.Highest,
            accessKey: 'i',
            accessKeyIndex: 1
        }]

    /*
        MAINTENANCE NOTE on these Date functions:
            Repetitious date-related code in this file has been extracted
            out in to several parseTypedDateFor....() functions over time.

            There is some similarity between these functions, and also
            some subtle differences.

            Future refactoring to simplify them would be welcomed.

            When editing of Done date is introduced, the functions
            parseTypedDateForDisplayUsingFutureDate() and parseTypedDateForDisplay()
            may collapse in to a single case.
     */

    /**
     * Parse and return the entered value for a date field.
     * @param fieldName
     * @param typedDate - what the user has entered, such as '2023-01-23' or 'tomorrow'
     * @param forwardDate
     * @returns the parsed date string. Includes "invalid" if {@code typedDate} was invalid.
     */
    function parseTypedDateForDisplay(
        fieldName: 'created' | 'start' | 'scheduled' | 'due' | 'done' | 'cancelled',
        typedDate: string,
        forwardDate: Date | undefined = undefined,
    ): string {
        if (!typedDate) {
            return `<i>no ${fieldName} date</i>`;
        }
        const parsed = chrono.parseDate(typedDate, forwardDate, {
            forwardDate: forwardDate != undefined,
        });
        if (parsed !== null) {
            return window.moment(parsed).format('YYYY-MM-DD');
        }
        return `<i>invalid ${fieldName} date</i>`;
    }

    /**
     * Like {@link parseTypedDateForDisplay} but also accounts for the 'Only future dates' setting.
     * @param fieldName
     * @param typedDate - what the user has entered, such as '2023-01-23' or 'tomorrow'
     * @returns the parsed date string. Includes "invalid" if {@code typedDate} was invalid.
     */
    function parseTypedDateForDisplayUsingFutureDate(fieldName: 'start' | 'scheduled' | 'due' | 'done' | 'created' | 'cancelled', typedDate: string): string {
        return parseTypedDateForDisplay(
            fieldName,
            typedDate,
            editableTask.forwardOnly ? new Date() : undefined,
        );
    }

    /**
     * Read the entered value for a date field, and return the value to be saved in the edited task.
     * @param typedDate - what the user has entered, such as '2023-01-23' or 'tomorrow'
     */
    function parseTypedDateForSaving(typedDate: string): moment.Moment | null {
        let date: moment.Moment | null = null;
        const parsedDate = chrono.parseDate(
            typedDate,
            new Date(),
            { forwardDate: editableTask.forwardOnly },
        );
        if (parsedDate !== null) {
            date = window.moment(parsedDate);
        }
        return date;
    }

    async function serialiseTaskId(task: Task) {
        if (task.id !== "") return task;

        const tasksWithId = allTasks.filter(task => task.id !== "");

        const updatedTask = ensureTaskHasId(task, tasksWithId.map(task => task.id));

        await replaceTaskWithTasks({originalTask: task, newTasks: updatedTask});

        return updatedTask;
    }

    $: accesskey = (key: string) => withAccessKeys ? key : null;
    $: formIsValid = isDueDateValid && isRecurrenceValid && isScheduledDateValid && isStartDateValid && isDescriptionValid && isCancelledDateValid && isCreatedDateValid && isDoneDateValid;
    $: isDescriptionValid = editableTask.description.trim() !== '';

    // NEW_TASK_FIELD_EDIT_REQUIRED
    $: {
        editableTask.startDate = doAutocomplete(editableTask.startDate);
        parsedStartDate = parseTypedDateForDisplayUsingFutureDate('start', editableTask.startDate);
        isStartDateValid = !parsedStartDate.includes('invalid');
    }

    $: {
        editableTask.scheduledDate = doAutocomplete(editableTask.scheduledDate);
        parsedScheduledDate = parseTypedDateForDisplayUsingFutureDate('scheduled', editableTask.scheduledDate);
        isScheduledDateValid = !parsedScheduledDate.includes('invalid');
    }

    $: {
        editableTask.dueDate = doAutocomplete(editableTask.dueDate);
        parsedDueDate = parseTypedDateForDisplayUsingFutureDate('due', editableTask.dueDate);
        isDueDateValid = !parsedDueDate.includes('invalid');
    }

    $: {
        editableTask.doneDate = doAutocomplete(editableTask.doneDate);
        parsedDoneDate = parseTypedDateForDisplayUsingFutureDate('done', editableTask.doneDate);
        isDoneDateValid = !parsedDoneDate.includes('invalid');
    }

    $: {
        editableTask.createdDate = doAutocomplete(editableTask.createdDate);
        parsedCreatedDate = parseTypedDateForDisplayUsingFutureDate('created', editableTask.createdDate);
        isCreatedDateValid = !parsedCreatedDate.includes('invalid');
    }

    $: {
        editableTask.cancelledDate = doAutocomplete(editableTask.cancelledDate);
        parsedCancelledDate = parseTypedDateForDisplayUsingFutureDate('cancelled', editableTask.cancelledDate);
        isCancelledDateValid = !parsedCancelledDate.includes('invalid');
    }

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

        for (const taskId of task.blockedBy) {
            const depTask = allTasks.find(cacheTask => cacheTask.id === taskId);

            if (!depTask) continue;

            blockedBy.push(depTask);
        }

        originalBlocking = allTasks.filter(cacheTask => cacheTask.blockedBy.includes(task.id));

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
            blocking: originalBlocking
        };

        mountComplete = true;

        setTimeout(() => {
            descriptionInput.focus();
        }, 10);
    });

    const _onPriorityKeyup = (event: KeyboardEvent) => {
        if (event.key && !event.altKey && !event.ctrlKey) {
            const priorityOption = priorityOptions.find(
                option => option.label.charAt(0).toLowerCase() == event.key);
            if (priorityOption) {
                editableTask.priority = priorityOption.value;
            }
        }
    }

    const _onClose = () => {
        onSubmit([]);
    }

    const _onDescriptionKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (formIsValid) _onSubmit();
        }
    }

    // this is called, when text is pasted or dropped into
    // the description field, to remove any linebreaks
    const _removeLinebreaksFromDescription = () => {
        // wrapped into a timer to run after the paste/drop event
        setTimeout(() => { editableTask.description = editableTask.description.replace(/[\r\n]+/g, ' ')}, 0);
    }

    const _onSubmit = async () => {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        let description = editableTask.description.trim();
        if (addGlobalFilterOnSave) {
            description = GlobalFilter.getInstance().prependTo(description);
        }

        const startDate = parseTypedDateForSaving(editableTask.startDate);
        const scheduledDate = parseTypedDateForSaving(editableTask.scheduledDate);
        const dueDate = parseTypedDateForSaving(editableTask.dueDate);

        const cancelledDate = parseTypedDateForSaving(editableTask.cancelledDate);
        const createdDate = parseTypedDateForSaving(editableTask.createdDate);
        const doneDate = parseTypedDateForSaving(editableTask.doneDate);

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
            if (task.id === "") {
                id = generateUniqueId(allTasks.filter(task => task.id !== "").map(task => task.id));
            }

            removedBlocking = originalBlocking.filter(task => !editableTask.blocking.includes(task))

            addedBlocking = editableTask.blocking.filter(task => !originalBlocking.includes(task))
        }

        const updatedTask = new Task({
            // NEW_TASK_FIELD_EDIT_REQUIRED
            ...task,
            description,
            status: editableTask.status,
            priority: parsedPriority,
            recurrence,
            startDate,
            scheduledDate,
            dueDate,
            doneDate,
            createdDate,
            cancelledDate,
            blockedBy: blockedByWithIds.map(task => task.id),
            id
        });

        for (const blocking of removedBlocking) {
            const newParent = removeDependency(blocking, updatedTask)
            await replaceTaskWithTasks({originalTask: blocking, newTasks: newParent});
        }

        for (const blocking of addedBlocking) {
            const newParent = addDependencyToParent(blocking, updatedTask)
            await replaceTaskWithTasks({originalTask: blocking, newTasks: newParent});
        }

        onSubmit([updatedTask]);
    };
</script>

<div class="tasks-modal">
    <form on:submit|preventDefault={_onSubmit} class:with-accesskeys="{withAccessKeys}">
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
                accesskey={accesskey("t")}
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
            {#each priorityOptions as {value, label, symbol, accessKey, accessKeyIndex}}
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
                        <span>{label.substring(0,accessKeyIndex)}</span><span class="accesskey">{label.substring(accessKeyIndex,accessKeyIndex+1)}</span><span>{label.substring(accessKeyIndex+1)}</span>
                        {#if symbol && symbol.charCodeAt(0) >= 0x100}
                            <span>{symbol}</span>
                        {/if}
                    </label>
                </span>
            {/each}
        </div>

        <!-- --------------------------------------------------------------------------- -->
        <!--  Recurrence and Dates  -->
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
                accesskey={accesskey("r")}
            />
            <code class="results">{recurrenceSymbol} {@html parsedRecurrence}</code>

            <!-- --------------------------------------------------------------------------- -->
            <!--  Due Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="due" class="accesskey-first">Due</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.dueDate}
                id="due"
                type="text"
                class="input"
                class:tasks-modal-error={!isDueDateValid}
                placeholder={datePlaceholder}
                accesskey={accesskey("d")}
            />
            <code class="results">{dueDateSymbol} {@html parsedDueDate}</code>

            <!-- --------------------------------------------------------------------------- -->
            <!--  Scheduled Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="scheduled" class="accesskey-first">Scheduled</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.scheduledDate}
                id="scheduled"
                type="text"
                class:tasks-modal-error={!isScheduledDateValid}
                class="input"
                placeholder={datePlaceholder}
                accesskey={accesskey("s")}
            />
            <code class="results">{scheduledDateSymbol} {@html parsedScheduledDate}</code>

            <!-- --------------------------------------------------------------------------- -->
            <!--  Start Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="start">St<span class="accesskey">a</span>rt</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.startDate}
                id="start"
                type="text"
                class:tasks-modal-error={!isStartDateValid}
                class="input"
                placeholder={datePlaceholder}
                accesskey={accesskey("a")}
            />
            <code class="results">{startDateSymbol} {@html parsedStartDate}</code>

            <!-- --------------------------------------------------------------------------- -->
            <!--  Only future dates  -->
            <!-- --------------------------------------------------------------------------- -->
            <div>
                <label for="forwardOnly">Only
                    <span class="accesskey-first">future</span> dates:</label>
                <!-- svelte-ignore a11y-accesskey -->
                <input
                    bind:checked={editableTask.forwardOnly}
                    id="forwardOnly"
                    type="checkbox"
                    class="input task-list-item-checkbox tasks-modal-checkbox"
                    accesskey={accesskey("f")}
                />
            </div>

            {#if allTasks.length > 0 && mountComplete}
                <!-- --------------------------------------------------------------------------- -->
                <!--  Blocked By Tasks  -->
                <!-- --------------------------------------------------------------------------- -->
                <label for="start">Blocked B<span class="accesskey">y</span></label>
                <Dependency type="blockedBy" task={task} editableTask={editableTask} allTasks={allTasks}
                            _onDescriptionKeyDown={_onDescriptionKeyDown} accesskey={accesskey} />

                <!-- --------------------------------------------------------------------------- -->
                <!--  Blocking Tasks  -->
                <!-- --------------------------------------------------------------------------- -->
                <label for="start" class="accesskey-first">Blocking</label>
                <Dependency type="blocking" task={task} editableTask={editableTask} allTasks={allTasks}
                            _onDescriptionKeyDown={_onDescriptionKeyDown} accesskey={accesskey} />
            {:else}
                <div><i>Blocking and blocked by fields are disabled when vault tasks is empty</i></div>
            {/if}
        </div>

        <!-- --------------------------------------------------------------------------- -->
        <!--  Status  -->
        <!-- --------------------------------------------------------------------------- -->
        <div class="tasks-modal-section">
            <label for="status">Stat<span class="accesskey">u</span>s</label>
            <!-- svelte-ignore a11y-accesskey -->
            <select bind:value={editableTask.status}
                    id="status-type"
                    class="dropdown"
                    accesskey={accesskey('u')}>
                {#each statusOptions as status}
                    <option value={status}>{status.name} [{status.symbol}]</option>
                {/each}
            </select>
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="tasks-modal-warning">⚠️ Changing the status does not yet auto-update Done or Cancelled Dates, nor create a new recurrence.
                Complete tasks via command, by clicking on task checkboxes or by right-clicking on task checkboxes.</label>
        </div>

        <div class="tasks-modal-section tasks-modal-status">
            <!-- --------------------------------------------------------------------------- -->
            <!--  Completed  -->
            <!-- --------------------------------------------------------------------------- -->
            <div>
                <label for="status">Completed:</label>
                <input
                    id="status"
                    type="checkbox"
                    class="task-list-item-checkbox tasks-modal-checkbox"
                    checked={editableTask.status.isCompleted()}
                    disabled
                />
            </div>
        </div>

        <div class="tasks-modal-section tasks-modal-dates">
            <!-- --------------------------------------------------------------------------- -->
            <!--  Created Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="created">Created</label>
            <input
                bind:value={editableTask.createdDate}
                id="created"
                type="text"
                class:tasks-modal-error={!isCreatedDateValid}
                class="input"
                placeholder={datePlaceholder}
            />
            <code class="results">{createdDateSymbol} {@html parsedCreatedDate}</code>

            <!-- --------------------------------------------------------------------------- -->
            <!--  Done Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="done">Done</label>
            <input
                bind:value={editableTask.doneDate}
                id="done"
                type="text"
                class:tasks-modal-error={!isDoneDateValid}
                class="input"
                placeholder={datePlaceholder}
            />
            <code class="results">{doneDateSymbol} {@html parsedDoneDate}</code>

            <!-- --------------------------------------------------------------------------- -->
            <!--  Cancelled Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="cancelled">Cancelled</label>
            <input
                bind:value={editableTask.cancelledDate}
                id="cancelled"
                type="text"
                class:tasks-modal-error={!isCancelledDateValid}
                class="input"
                placeholder={datePlaceholder}
            />
            <code class="results">{cancelledDateSymbol} {@html parsedCancelledDate}</code>
        </div>

        <div class="tasks-modal-section tasks-modal-buttons">
            <button disabled={!formIsValid} type="submit" class="mod-cta">Apply
            </button>
            <button type="button" on:click={_onClose}>Cancel</button>
        </div>
    </form>
</div>
