<script lang="ts">
    import * as chrono from 'chrono-node';
    import { onMount } from 'svelte';
    import { Recurrence } from '../Recurrence';
    import { getSettings, TASK_FORMATS } from '../Config/Settings';
    import { GlobalFilter } from '../Config/GlobalFilter';
    import { Status } from '../Status';
    import { Priority, Task } from '../Task';
    import { doAutocomplete } from '../DateAbbreviations';
    import { TasksDate } from '../Scripting/TasksDate';
    import {computePosition, flip, offset, shift, size} from "@floating-ui/dom";
    import { addDependencyToParent, ensureTaskHasId, generateUniqueId, removeDependency } from "../TaskDependency";
    import { replaceTaskWithTasks } from "../File";

    // These exported variables are passed in as props by TaskModal.onOpen():
    export let task: Task;
    export let onSubmit: (updatedTasks: Task[]) => void | Promise<void>;
    export let statusOptions: Status[];
    export let allTasks: Task[];

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
        priority: 'none' | 'lowest' | 'low' | 'medium' | 'high' | 'highest';
        recurrenceRule: string;
        createdDate: string;
        startDate: string;
        scheduledDate: string;
        dueDate: string;
        doneDate: string;
        forwardOnly: boolean;
        waitingOn: Task[];
        blocking: Task[];
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
        forwardOnly: true,
        waitingOn: [],
        blocking: []
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

    let waitingOnSearch: string = '';
    let waitingOnSearchResults: Task[] | null = null;
    let waitingOnSearchIndex: number | null = 0;

    let originalBlocking: Task[] = [];

    let blockingSearch: string = '';
    let blockingSearchResults: Task[] | null = null;
    let blockingSearchIndex: number | null = 0;

    let displayResultsIfSearchEmpty = false;

    let waitingOnFocused = false;
    let blockingFocused = false;

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

    function addWaitingOnTask(task: Task) {
        editableTask.waitingOn = [...editableTask.waitingOn, task];
        waitingOnSearch = '';
        waitingOnFocused = false;
    }

    function removeWaitingOnTask(task: Task) {
        editableTask.waitingOn = editableTask.waitingOn.filter(item => item !== task)
    }

    function addBlockingTask(task: Task) {
        editableTask.blocking = [...editableTask.blocking, task];
        blockingSearch = '';
        blockingFocused = false;
    }

    function removeBlockingTask(task: Task) {
        editableTask.blocking = editableTask.blocking.filter(item => item !== task)
    }

    async function serialiseTaskId(task: Task) {
        if (task.id !== "") return task;

        const tasksWithId = allTasks.filter(task => task.id !== "");

        const updatedTask = ensureTaskHasId(task, tasksWithId.map(task => task.id));

        await replaceTaskWithTasks({originalTask: task, newTasks: updatedTask});

        return updatedTask;
    }

    function generateSearchResults(search: string) {
        if (!search && !displayResultsIfSearchEmpty) return [];

        displayResultsIfSearchEmpty = false;

        let results = allTasks.filter(task => task.description.toLowerCase().includes(search.toLowerCase()));

        // remove itself, and tasks this task already has a relationship with from results
        results = results.filter((item) => {
            // line number is unavailable for the task being edited
            // Known issue - filters out duplicate lines in task file
            const sameFile = item.description === task.description &&
                item.taskLocation.path === task.taskLocation.path &&
                item.originalMarkdown === task.originalMarkdown

            return ![...editableTask.waitingOn, ...editableTask.blocking].includes(item) && !sameFile;
        });

        // search results favour tasks from the same file as this task
        results.sort((a, b) => {
            const aInSamePath = a.taskLocation.path === task.taskLocation.path;
            const bInSamePath = b.taskLocation.path === task.taskLocation.path;

            // prioritise tasks close to this task in the same file
            if (aInSamePath && bInSamePath) {
                return Math.abs(a.taskLocation.lineNumber - task.taskLocation.lineNumber)
                    - Math.abs(b.taskLocation.lineNumber - task.taskLocation.lineNumber);
            } else if (aInSamePath) {
                return -1;
            } else if (bInSamePath) {
                return 1;
            } else {
                return 0;
            }
        });

        return results.slice(0,5);
    }

    function taskKeydown(e: KeyboardEvent, field: "waitingOn" | "blocking") {
        const resultsList = field === "waitingOn" ? waitingOnSearchResults : blockingSearchResults;
        let searchIndex = field === "waitingOn" ? waitingOnSearchIndex : blockingSearchIndex;

        if (resultsList === null) return;

        switch(e.key) {
            case "ArrowUp":
                e.preventDefault();
                if (searchIndex === 0 || searchIndex === null) {
                    searchIndex = resultsList.length - 1;
                } else {
                    searchIndex -= 1;
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (searchIndex === resultsList.length - 1 || searchIndex === null) {
                    searchIndex = 0;
                } else {
                    searchIndex += 1;
                }
                break;
            case "Enter":
                if (searchIndex !== null) {
                    e.preventDefault();
                    if (field === "waitingOn") {
                        addWaitingOnTask(resultsList[searchIndex]);
                        searchIndex = null;
                        waitingOnFocused = false
                    }
                    else {
                        addBlockingTask(resultsList[searchIndex]);
                        searchIndex = null;
                        blockingFocused = false
                    }
                } else {
                    _onDescriptionKeyDown(e);
                }
                break;
            default:
                searchIndex = 0;
                break;
        }

        if (field === "waitingOn") {
            waitingOnSearchIndex = searchIndex;
        } else {
            blockingSearchIndex = searchIndex;
        }
    }

    function onWaitingFocused() {
        waitingOnFocused = true;
        displayResultsIfSearchEmpty = true;
    }

    function onBlockingFocused() {
        blockingFocused = true;
        displayResultsIfSearchEmpty = true;
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
            } else if (!editableTask.startDate && !editableTask.scheduledDate && !editableTask.dueDate) {
                parsedRecurrence = '<i>due/scheduled/start date needs to be set</i>';
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

    $: {
        waitingOnSearchResults = waitingOnFocused ? generateSearchResults(waitingOnSearch) : null;
    }

    $: {
        blockingSearchResults = blockingFocused ? generateSearchResults(blockingSearch) : null;
    }


    let waitingInputWidth: number;
    let waitingOnRef: HTMLElement;
    let waitingOnContent: HTMLElement;

    $: {
        if (waitingOnRef && waitingOnContent) {
            computePosition(waitingOnRef, waitingOnContent, {
                middleware: [
                    offset(6),
                    shift(),
                    flip(),
                    size({
                        apply() {
                            waitingOnContent && Object.assign(waitingOnContent.style, {
                                width: `${waitingInputWidth}px`,
                            });
                        },
                    })

                ]
            }).then(({x, y}) => {
                Object.assign(waitingOnContent.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                });
            });
        }
    }

    let blockingRef: HTMLElement;
    let blockingContent: HTMLElement;

    $: {
        if (blockingRef && blockingContent) {
            computePosition(blockingRef, blockingContent, {
                middleware: [
                    offset(6),
                    shift(),
                    flip(),
                    size({
                        apply() {
                            blockingContent && Object.assign(blockingContent.style, {
                                width: `${waitingInputWidth}px`,
                            });
                        },
                    })

                ]
            }).then(({x, y}) => {
                Object.assign(blockingContent.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                });
            });
        }
    }

    let waitingOnChips: HTMLElement[] = [];
    let blockingChips: HTMLElement[] = [];

    function showDescriptionTooltip(element: HTMLElement, task: Task) {
        const tooltip = element.createDiv();
        tooltip.addClasses(['tooltip', 'pop-up']);
        tooltip.innerText = task.descriptionWithoutTags;

        computePosition(element, tooltip, {
            placement: "top",
            middleware: [
                offset(-18),
                shift()
            ]
        }).then(({x, y}) => {
            Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        });

        element.addEventListener('mouseleave', () => {
            tooltip.remove();
        });
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

        const waitingOn: Task[] = [];

        for (const taskId of task.dependsOn) {
            const depTask = allTasks.find(cacheTask => cacheTask.id === taskId);

            if (!depTask) continue;

            waitingOn.push(depTask);
        }

        originalBlocking = allTasks.filter(cacheTask => cacheTask.dependsOn.includes(task.id));

        editableTask = {
            description,
            status: task.status,
            priority,
            recurrenceRule: task.recurrence ? task.recurrence.toText() : '',
            createdDate: new TasksDate(task.createdDate).formatAsDate(),
            startDate: new TasksDate(task.startDate).formatAsDate(),
            scheduledDate: new TasksDate(task.scheduledDate).formatAsDate(),
            dueDate: new TasksDate(task.dueDate).formatAsDate(),
            doneDate: new TasksDate(task.doneDate).formatAsDate(),
            forwardOnly: true,
            waitingOn,
            blocking: originalBlocking
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

    const _displayableFilePath = (path: string) => {
        if (path === task.taskLocation.path) return "";

        path = path.slice(0,-3);

        return path.length > 20 ? path.substring(0, 17) + "..." : path;
    }

    const _onSubmit = async () => {
        let description = editableTask.description.trim();
        if (addGlobalFilterOnSave) {
            description = GlobalFilter.getInstance().prependTo(description);
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

        let waitingOnWithIds = [];

        for (const depTask of editableTask.waitingOn) {
            const newDep = await serialiseTaskId(depTask);
            waitingOnWithIds.push(newDep);
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
            dependsOn: waitingOnWithIds.map(task => task.id),
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

            {#if allTasks.length > 0}
                <!-- --------------------------------------------------------------------------- -->
                <!--  Waiting on Tasks  -->
                <!-- --------------------------------------------------------------------------- -->
                <label for="start" class="accesskey-first">Waiting On</label>
                <!-- svelte-ignore a11y-accesskey -->
                <span bind:clientWidth={waitingInputWidth}>
                    <input
                        bind:this={waitingOnRef}
                        bind:value={waitingOnSearch}
                        on:keydown={(e) => taskKeydown(e, "waitingOn")}
                        on:focus={onWaitingFocused}
                        on:blur={() => waitingOnFocused = false}
                        accesskey={accesskey("w")}
                        id="waitingOn"
                        type="text"
                        placeholder="Type to search..."
                    />
                </span>
                {#if waitingOnSearchResults && waitingOnSearchResults.length !== 0}
                    <ul class="suggested-tasks"
                        bind:this={waitingOnContent}
                        on:mouseleave={() => waitingOnSearchIndex = null}>
                        {#each waitingOnSearchResults as searchTask, index}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <li on:mousedown={() => addWaitingOnTask(searchTask)}
                                class:selected={waitingOnSearchIndex !== null && index === waitingOnSearchIndex}
                                on:mouseenter={() => waitingOnSearchIndex = index}
                            >
                                <div class="dependency-name">[{searchTask.status.symbol}] {searchTask.descriptionWithoutTags}</div>
                                <div class="dependency-location">{_displayableFilePath(searchTask.taskLocation.path)}</div>
                            </li>
                        {/each}
                    </ul>
                {/if}
                <div class="chip-container" >
                    {#each editableTask.waitingOn as task, idx}
                        <div class="chip"
                             bind:this={waitingOnChips[idx]}
                             on:mouseenter={() => showDescriptionTooltip(waitingOnChips[idx], task)}>
                            <span class="chip-name">[{task.status.symbol}] {task.descriptionWithoutTags}</span>

                            <button on:click={() => removeWaitingOnTask(task)} type="button" class="chip-close">
                                <svg style="display: block; margin: auto;" xmlns="http://www.w3.org/2000/svg" width="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    {/each}
                </div>

                <!-- --------------------------------------------------------------------------- -->
                <!--  Blocking Tasks  -->
                <!-- --------------------------------------------------------------------------- -->
                <label for="start" class="accesskey-first">Blocking</label>
                <!-- svelte-ignore a11y-accesskey -->
                <input
                    bind:this={blockingRef}
                    bind:value={blockingSearch}
                    on:keydown={(e) => taskKeydown(e, "blocking")}
                    on:focus={onBlockingFocused}
                    on:blur={() => blockingFocused = false}
                    accesskey={accesskey("b")}
                    id="blocking"
                    type="text"
                    placeholder="Type to search..."
                />
                {#if blockingSearchResults && blockingSearchResults.length !== 0}
                    <ul class="suggested-tasks"
                        bind:this={blockingContent}
                        on:mouseleave={() => blockingSearchIndex = null}>
                        {#each blockingSearchResults as searchTask, index}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <li on:mousedown={() => addBlockingTask(searchTask)}
                                class:selected={blockingSearch !== null && index === blockingSearchIndex}
                                on:mouseenter={() => blockingSearchIndex = index}>
                                <div class="dependency-name">[{searchTask.status.symbol}] {searchTask.descriptionWithoutTags}</div>
                                <div class="dependency-location">{_displayableFilePath(searchTask.taskLocation.path)}</div>
                            </li>
                        {/each}
                    </ul>
                {/if}
                <div class="chip-container">
                    {#each editableTask.blocking as task, idx}
                        <div class="chip"
                             bind:this={blockingChips[idx]}
                             on:mouseenter={() => showDescriptionTooltip(blockingChips[idx], task)}>
                            <span class="chip-name">[{task.status.symbol}] {task.descriptionWithoutTags}</span>

                            <button on:click={() => removeBlockingTask(task)} type="button" class="chip-close">
                                <svg style="display: block; margin: auto;" xmlns="http://www.w3.org/2000/svg" width="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    {/each}
                </div>
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
