<script lang="ts">
    import * as chrono from 'chrono-node';
    import { onMount } from 'svelte';
    import { Recurrence } from '../Recurrence';
    import { getSettings, TASK_FORMATS } from '../Config/Settings';
    import { GlobalFilter } from '../Config/GlobalFilter';
    import { Status } from '../Status';
    import { Priority, Task } from '../Task';
    import { doAutocomplete } from '../DateAbbreviations';

    // These exported variables are passed in as props by TaskModal.onOpen():
    export let task: Task;
    export let onSubmit: (updatedTasks: Task[]) => void | Promise<void>;
    export let statusOptions: Status[];

    const {
        prioritySymbols,
        recurrenceSymbol,
        startDateSymbol,
        scheduledDateSymbol,
        dueDateSymbol,
    } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

    let descriptionInput: HTMLTextAreaElement;
    let editableTask: {
        description: string;
        status: Status;
        priority: 'none' | 'low' | 'medium' | 'high';
        recurrenceRule: string;
        createdDate: string;
        startDate: string;
        scheduledDate: string;
        dueDate: string;
        doneDate: string;
        forwardOnly: boolean;
    } = {
        description: '',
        status: Status.TODO,
        priority: 'none',
        recurrenceRule: '',
        createdDate: '',
        startDate: '',
        scheduledDate: '',
        dueDate: '',
        doneDate: '',
        forwardOnly: true
    };

    let isDescriptionValid: boolean = true;
    let parsedCreated: string = '';
    let parsedStartDate: string = '';
    let isStartDateValid: boolean = true;
    let parsedScheduledDate: string = '';
    let isScheduledDateValid: boolean = true;
    let parsedDueDate: string = '';
    let isDueDateValid: boolean = true;
    let parsedRecurrence: string = '';
    let isRecurrenceValid: boolean = true;
    let parsedDone: string = '';
    let addGlobalFilterOnSave: boolean = false;
    let withAccessKeys: boolean = true;
    let formIsValid: boolean = true;

    // 'weekend' abbreviation ommitted due to lack of space.
    let datePlaceholder =
        "Try 'Monday' or 'tomorrow', or [td|tm|yd|tw|nw|we] then space.";

    const priorityOptions: {
            value: typeof editableTask.priority,
            label: string,
            symbol: string }[] =
        [{
            value: 'low',
            label: 'Low',
            symbol: prioritySymbols.Low
        }, {
            value: 'none',
            label: 'Normal',
            symbol: prioritySymbols.None
        }, {
            value: 'medium',
            label: 'Medium',
            symbol: prioritySymbols.Medium
        }, {
            value: 'high',
            label: 'High',
            symbol: prioritySymbols.High
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
        fieldName: 'created' | 'start' | 'scheduled' | 'due' | 'done',
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
    function parseTypedDateForDisplayUsingFutureDate(fieldName: 'start' | 'scheduled' | 'due' | 'done', typedDate: string): string {
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

    $: accesskey = (key: string) => withAccessKeys ? key : null;
    $: formIsValid = isDueDateValid && isRecurrenceValid && isScheduledDateValid && isStartDateValid && isDescriptionValid;
    $: isDescriptionValid = editableTask.description.trim() !== '';

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
            } else {
                parsedRecurrence = recurrenceFromText;
            }
        }
    }

    $: {
        parsedCreated = parseTypedDateForDisplay('created', editableTask.createdDate);
        parsedDone = parseTypedDateForDisplay('done', editableTask.doneDate);
    }

    onMount(() => {
        const { provideAccessKeys } = getSettings();
        withAccessKeys = provideAccessKeys;
        const description = GlobalFilter.removeAsWordFrom(task.description);
        // If we're displaying to the user the description without the global filter (i.e. it was removed in the method
        // above), or if the description did not include a global filter in the first place, we'll add the global filter
        // when saving the task.
        if (description != task.description || !GlobalFilter.includedIn(task.description)) {
            addGlobalFilterOnSave = true;
        }
        let priority: typeof editableTask.priority = 'none';
        if (task.priority === Priority.Low) {
            priority = 'low';
        } else if (task.priority === Priority.Medium) {
            priority = 'medium';
        } else if (task.priority === Priority.High) {
            priority = 'high';
        }

        editableTask = {
            description,
            status: task.status,
            priority,
            recurrenceRule: task.recurrence ? task.recurrence.toText() : '',
            createdDate: task.createdDate
                ? task.createdDate.format('YYYY-MM-DD')
                : '',
            startDate: task.startDate
                ? task.startDate.format('YYYY-MM-DD')
                : '',
            scheduledDate: task.scheduledDate
                ? task.scheduledDate.format('YYYY-MM-DD')
                : '',
            dueDate: task.dueDate ? task.dueDate.format('YYYY-MM-DD') : '',
            doneDate: task.doneDate ? task.doneDate.format('YYYY-MM-DD') : '',
            forwardOnly: true,
        };
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

    const _onSubmit = () => {
        let description = editableTask.description.trim();
        if (addGlobalFilterOnSave) {
            description = GlobalFilter.prependTo(description);
        }

        const startDate = parseTypedDateForSaving(editableTask.startDate);

        const scheduledDate = parseTypedDateForSaving(editableTask.scheduledDate);

        const dueDate = parseTypedDateForSaving(editableTask.dueDate);

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
            case 'low':
                parsedPriority = Priority.Low;
                break;
            case 'medium':
                parsedPriority = Priority.Medium;
                break;
            case 'high':
                parsedPriority = Priority.High;
                break;
            default:
                parsedPriority = Priority.None;
        }

        const updatedTask = new Task({
            ...task,
            description,
            status: editableTask.status,
            priority: parsedPriority,
            recurrence,
            startDate,
            scheduledDate,
            dueDate,
            doneDate: window
                .moment(editableTask.doneDate, 'YYYY-MM-DD')
                .isValid()
                ? window.moment(editableTask.doneDate, 'YYYY-MM-DD')
                : null,
        });

        onSubmit([updatedTask]);
    };
</script>

<div class="tasks-modal">
    <form on:submit|preventDefault={_onSubmit} class:with-accesskeys="{withAccessKeys}">
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
                type="text"
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
            {#each priorityOptions as {value, label, symbol}}
                <span>
                    <!-- svelte-ignore a11y-accesskey -->
                    <input
                        type="radio"
                        id="priority-{value}"
                        {value}
                        bind:group={editableTask.priority}
                        accesskey={accesskey(label.charAt(0).toLowerCase())}
                    />
                    <label for="priority-{value}">
                        <span class="accesskey-first">{label}</span>
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
                placeholder="Try 'every 2 weeks on Thursday'."
                accesskey={accesskey("r")}
            />
            <code>{recurrenceSymbol} {@html parsedRecurrence}</code>

            <!-- --------------------------------------------------------------------------- -->
            <!--  Due Date  -->
            <!-- --------------------------------------------------------------------------- -->
            <label for="due" class="accesskey-first">Due</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.dueDate}
                id="due"
                type="text"
                class:tasks-modal-error={!isDueDateValid}
                placeholder={datePlaceholder}
                accesskey={accesskey("d")}
            />
            <code>{dueDateSymbol} {@html parsedDueDate}</code>

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
                placeholder={datePlaceholder}
                accesskey={accesskey("s")}
            />
            <code>{scheduledDateSymbol} {@html parsedScheduledDate}</code>

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
                placeholder={datePlaceholder}
                accesskey={accesskey("a")}
            />
            <code>{startDateSymbol} {@html parsedStartDate}</code>

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
                    class="task-list-item-checkbox tasks-modal-checkbox"
                    accesskey={accesskey("f")}
                />
            </div>
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

            <!-- --------------------------------------------------------------------------- -->
            <!--  Created on  -->
            <!-- --------------------------------------------------------------------------- -->
            <div>
                <span>Created on:</span>
                <code>{@html parsedCreated}</code>
            </div>
            <!-- --------------------------------------------------------------------------- -->
            <!--  Done on  -->
            <!-- --------------------------------------------------------------------------- -->
            <div>
                <span>Done on:</span>
                <code>{@html parsedDone}</code>
            </div>
        </div>
        <div class="tasks-modal-section tasks-modal-buttons">
            <button disabled={!formIsValid} type="submit" class="mod-cta">Apply
            </button>
            <button type="button" on:click={_onClose}>Cancel</button>
        </div>
    </form>
</div>
