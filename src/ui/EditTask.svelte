<script lang="ts">
    import * as chrono from 'chrono-node';
    import { onMount } from 'svelte';
    import { Recurrence } from '../Recurrence';
    import { getSettings } from '../Config/Settings';
    import { Priority, Status, Task } from '../Task';
    import {
        prioritySymbols,
        recurrenceSymbol,
        startDateSymbol,
        scheduledDateSymbol,
        dueDateSymbol,
    } from '../Task';
    import { doAutocomplete } from '../DateAbbreviations';

    export let task: Task;
    export let onSubmit: (updatedTasks: Task[]) => void | Promise<void>;

    let descriptionInput: HTMLInputElement;
    let editableTask: {
        description: string;
        status: Status;
        priority: 'none' | 'low' | 'medium' | 'high';
        recurrenceRule: string;
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
        startDate: '',
        scheduledDate: '',
        dueDate: '',
        doneDate: '',
        forwardOnly: true
    };

    let parsedStartDate: string = '';
    let parsedScheduledDate: string = '';
    let parsedDueDate: string = '';
    let parsedRecurrence: string = '';
    let parsedDone: string = '';
    let addGlobalFilterOnSave: boolean = false;

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

    function parseDate(
        type: 'start' | 'scheduled' | 'due' | 'done',
        date: string,
        forwardDate: Date | undefined = undefined,
    ): string {
        if (!date) {
            return `<i>no ${type} date</i>`;
        }
        const parsed = chrono.parseDate(date, forwardDate, {
            forwardDate: forwardDate != undefined,
        });
        if (parsed !== null) {
            return window.moment(parsed).format('YYYY-MM-DD');
        }
        return `<i>invalid ${type} date</i>`;
    }

    $: {
        editableTask.startDate = doAutocomplete(editableTask.startDate);
        parsedStartDate = parseDate(
            'start',
            editableTask.startDate,
            editableTask.forwardOnly ? new Date() : undefined,
        );
    }

    $: {
        editableTask.scheduledDate = doAutocomplete(editableTask.scheduledDate);
        parsedScheduledDate = parseDate(
            'scheduled',
            editableTask.scheduledDate,
            editableTask.forwardOnly ? new Date() : undefined,
        );
    }

    $: {
        editableTask.dueDate = doAutocomplete(editableTask.dueDate);
        parsedDueDate = parseDate(
            'due',
            editableTask.dueDate,
            editableTask.forwardOnly ? new Date() : undefined,
        );
    }

    $: {
        if (!editableTask.recurrenceRule) {
            parsedRecurrence = '<i>not recurring</>';
        } else {
            parsedRecurrence =
                Recurrence.fromText({
                    recurrenceRuleText: editableTask.recurrenceRule,
                    // Only for representation in the modal, no dates required.
                    startDate: null,
                    scheduledDate: null,
                    dueDate: null,
                })?.toText() ?? '<i>invalid recurrence rule</i>';
        }
    }

    $: {
        parsedDone = parseDate('done', editableTask.doneDate);
    }

    onMount(() => {
        const { globalFilter } = getSettings();
        const description = task.getDescriptionWithoutGlobalFilter();
        // If we're displaying to the user the description without the global filter (i.e. it was removed in the method
        // above), or if the description did not include a global filter in the first place, we'll add the global filter
        // when saving the task.
        // Another special case is when the global filter is empty: in this case there's an "empty" match in the `indexOf`
        // (it returns 0), and thus we *don't* set addGlobalFilterOnSave.
        if (description != task.description || description.indexOf(globalFilter) == -1)
            addGlobalFilterOnSave = true;
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

    const _onSubmit = () => {
        const { globalFilter } = getSettings();
        let description = editableTask.description.trim();
        if (addGlobalFilterOnSave) {
            description = globalFilter + ' ' + description;
        }

        let startDate: moment.Moment | null = null;
        const parsedStartDate = chrono.parseDate(
            editableTask.startDate,
            new Date(),
            { forwardDate: editableTask.forwardOnly },
        );
        if (parsedStartDate !== null) {
            startDate = window.moment(parsedStartDate);
        }

        let scheduledDate: moment.Moment | null = null;
        const parsedScheduledDate = chrono.parseDate(
            editableTask.scheduledDate,
            new Date(),
            { forwardDate: editableTask.forwardOnly },
        );
        if (parsedScheduledDate !== null) {
            scheduledDate = window.moment(parsedScheduledDate);
        }

        let dueDate: moment.Moment | null = null;
        const parsedDueDate = chrono.parseDate(
            editableTask.dueDate,
            new Date(),
            { forwardDate: editableTask.forwardOnly },
        );
        if (parsedDueDate !== null) {
            dueDate = window.moment(parsedDueDate);
        }

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
    <form on:submit|preventDefault={_onSubmit}>
        <div class="tasks-modal-section">
            <label for="description">Descrip<span class="accesskey">t</span>ion</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.description}
                bind:this={descriptionInput}
                id="description"
                type="text"
                class="tasks-modal-description"
                placeholder="Take out the trash"
                accesskey="t"
            />
        </div>
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
                        accesskey={label.charAt(0).toLowerCase()}
                    />
                    <label for="priority-{value}">
                        {#if symbol && symbol.charCodeAt(0) >= 0x100}<span>{symbol}</span>{/if}
                        <span class="accesskey-first">{label}</span>
                    </label>
                </span>
            {/each}
        </div>
        <div class="tasks-modal-section tasks-modal-dates">
            <label for="recurrence" class="accesskey-first">Recurs</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.recurrenceRule}
                id="description"
                type="text"
                placeholder="Try 'every 2 weeks on Thursday'."
                accesskey="r"
            />
            <code>{recurrenceSymbol} {@html parsedRecurrence}</code>
            <label for="due" class="accesskey-first">Due</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.dueDate}
                id="due"
                type="text"
                placeholder={datePlaceholder}
                accesskey="d"
            />
            <code>{dueDateSymbol} {@html parsedDueDate}</code>
            <label for="scheduled" class="accesskey-first">Scheduled</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.scheduledDate}
                id="scheduled"
                type="text"
                placeholder={datePlaceholder}
                accesskey="s"
            />
            <code>{scheduledDateSymbol} {@html parsedScheduledDate}</code>
            <label for="start">St<span class="accesskey">a</span>rt</label>
            <!-- svelte-ignore a11y-accesskey -->
            <input
                bind:value={editableTask.startDate}
                id="start"
                type="text"
                placeholder={datePlaceholder}
                accesskey="a"
            />
            <code>{startDateSymbol} {@html parsedStartDate}</code>
            <div>
                <label for="forwardOnly">Only <span class="accesskey-first">future</span> dates:</label>
                <!-- svelte-ignore a11y-accesskey -->
                <input
                    bind:checked={editableTask.forwardOnly}
                    id="forwardOnly"
                    type="checkbox"
                    class="task-list-item-checkbox tasks-modal-checkbox"
                    accesskey="f"
                />
            </div>
        </div>
        <div class="tasks-modal-section tasks-modal-status">
            <div>
                <label for="status">Status:</label>
                <input
                    id="status"
                    type="checkbox"
                    class="task-list-item-checkbox tasks-modal-checkbox"
                    checked={editableTask.status === Status.DONE}
                    disabled
                />
                <code>{editableTask.status}</code>
            </div>
            <div>
                <span>Done on:</span>
                <code>{@html parsedDone}</code>
            </div>
        </div>
        <div class="tasks-modal-section tasks-modal-buttons">
            <button type="submit" class="mod-cta">Apply</button>
            <button type="button" on:click={_onClose}>Cancel</button>
        </div>
    </form>
</div>
