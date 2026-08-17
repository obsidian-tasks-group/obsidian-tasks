<script lang="ts">
    import { onMount } from 'svelte';
    import { defaultEditModalShowSettings } from '../Config/EditModalShowSettings';

    import { TASK_FORMATS, getSettings } from '../Config/Settings';
    import type { Status } from '../Statuses/Status';
    import type { Task } from '../Task/Task';
    import { settingsStore } from './SettingsStore';
    import DateEditor from './DateEditor.svelte';
    import Dependency from './Dependency.svelte';
    import { EditableTask } from './EditableTask';
    import { focusOnceClearOfKeyboard, labelContentWithAccessKey } from './EditTaskHelpers';
    import PriorityEditor from './PriorityEditor.svelte';
    import RecurrenceEditor from './RecurrenceEditor.svelte';
    import StatusEditor from './StatusEditor.svelte';

    // These exported variables are passed in as props by TaskModal.onOpen():
    export let task: Task;
    export let onSubmit: (updatedTasks: Task[]) => void | Promise<void>;
    export let statusOptions: Status[];
    export let allTasks: Task[];

    const {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        startDateSymbol,
        scheduledDateSymbol,
        dueDateSymbol,
        cancelledDateSymbol,
        createdDateSymbol,
        doneDateSymbol,
    } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

    let descriptionInput: HTMLTextAreaElement;

    let editableTask = EditableTask.fromTask(task, allTasks);

    let isDescriptionValid: boolean = true;

    let isCancelledDateValid: boolean = true;
    let isCreatedDateValid: boolean = true;
    let isDoneDateValid: boolean = true;
    let isDueDateValid: boolean = true;
    let isScheduledDateValid: boolean = true;
    let isStartDateValid: boolean = true;

    let isRecurrenceValid: boolean = true;

    let withAccessKeys: boolean = true;
    let formIsValid: boolean = true;

    let mountComplete = false;

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

    $: isShownInEditModal = { ...defaultEditModalShowSettings, ...$settingsStore.isShownInEditModal };

    onMount(() => {
        settingsStore.set(getSettings());

        const { provideAccessKeys } = getSettings();
        withAccessKeys = provideAccessKeys;

        mountComplete = true;

        // Put the cursor in the Description field, ready to type. On a phone this has to wait for
        // the modal to finish sliding up first, or the keyboard drags the form down with it
        focusOnceClearOfKeyboard(descriptionInput);
    });

    const _onClose = () => {
        onSubmit([]);
    };

    const _onDescriptionKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.isComposing) {
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
        const newTasks = await editableTask.applyEdits(task, allTasks);
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
    {#if isShownInEditModal.priority}
        <section class="tasks-modal-priority-section">
            <PriorityEditor bind:priority={editableTask.priority} {withAccessKeys} />
        </section>
        <hr id="line-after-priority" />
    {/if}

    <!-- --------------------------------------------------------------------------- -->
    <!--  Dates  -->
    <!-- --------------------------------------------------------------------------- -->
    <section class="tasks-modal-dates-section">
        <!-- --------------------------------------------------------------------------- -->
        <!--  Recurrence  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if isShownInEditModal.recurrence}
            <RecurrenceEditor {editableTask} bind:isRecurrenceValid accesskey={accesskey('r')} />
        {/if}
        <!-- --------------------------------------------------------------------------- -->
        <!--  Due Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if isShownInEditModal.due}
            <DateEditor
                id="due"
                dateSymbol={dueDateSymbol}
                bind:date={editableTask.dueDate}
                bind:isDateValid={isDueDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={accesskey('d')}
            />
        {/if}

        <!-- --------------------------------------------------------------------------- -->
        <!--  Scheduled Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if isShownInEditModal.scheduled}
            <DateEditor
                id="scheduled"
                dateSymbol={scheduledDateSymbol}
                bind:date={editableTask.scheduledDate}
                bind:isDateValid={isScheduledDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={accesskey('s')}
            />
        {/if}

        <!-- --------------------------------------------------------------------------- -->
        <!--  Start Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if isShownInEditModal.start}
            <DateEditor
                id="start"
                dateSymbol={startDateSymbol}
                bind:date={editableTask.startDate}
                bind:isDateValid={isStartDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={accesskey('a')}
            />
        {/if}

        <!-- --------------------------------------------------------------------------- -->
        <!--  Only future dates  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if isShownInEditModal.due || isShownInEditModal.scheduled || isShownInEditModal.start}
            <div class="future-dates-only" id="only-future-dates">
                <label for="forwardOnly">{@html labelContentWithAccessKey('Only future dates:', accesskey('f'))}</label>
                <!-- svelte-ignore a11y-accesskey -->
                <input
                    bind:checked={editableTask.forwardOnly}
                    id="forwardOnly"
                    type="checkbox"
                    class="task-list-item-checkbox tasks-modal-checkbox"
                    accesskey={accesskey('f')}
                />
            </div>
        {/if}
    </section>
    {#if isShownInEditModal.due || isShownInEditModal.scheduled || isShownInEditModal.start}
        <hr id="line-after-happens-dates" />
    {/if}

    <!-- --------------------------------------------------------------------------- -->
    <!--  Dependencies  -->
    <!-- --------------------------------------------------------------------------- -->
    <section class="tasks-modal-dependencies-section">
        {#if allTasks.length > 0 && mountComplete}
            <!-- --------------------------------------------------------------------------- -->
            <!--  Blocked By Tasks  -->
            <!-- --------------------------------------------------------------------------- -->
            {#if isShownInEditModal.before_this}
                <Dependency
                    id="before_this"
                    type="blockedBy"
                    labelText="Before this"
                    {task}
                    {editableTask}
                    {allTasks}
                    {_onDescriptionKeyDown}
                    accesskey={accesskey('b')}
                    placeholder="Search for tasks that the task being edited depends on..."
                />
            {/if}

            <!-- --------------------------------------------------------------------------- -->
            <!--  Blocking Tasks  -->
            <!-- --------------------------------------------------------------------------- -->
            {#if isShownInEditModal.after_this}
                <Dependency
                    id="after_this"
                    type="blocking"
                    labelText="After this"
                    {task}
                    {editableTask}
                    {allTasks}
                    {_onDescriptionKeyDown}
                    accesskey={accesskey('e')}
                    placeholder="Search for tasks that depend on this task being done..."
                />
            {/if}
        {:else}
            <div><i>Blocking and blocked by fields are disabled when vault tasks is empty</i></div>
        {/if}
    </section>
    {#if isShownInEditModal.before_this || isShownInEditModal.after_this}
        <hr id="line-after-dependencies" />
    {/if}

    <section class="tasks-modal-dates-section">
        <!-- --------------------------------------------------------------------------- -->
        <!--  Status  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if isShownInEditModal.status}
            <StatusEditor {task} bind:editableTask {statusOptions} accesskey={accesskey('u')} />
        {/if}

        <!-- --------------------------------------------------------------------------- -->
        <!--  Created Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if isShownInEditModal.created}
            <DateEditor
                id="created"
                dateSymbol={createdDateSymbol}
                bind:date={editableTask.createdDate}
                bind:isDateValid={isCreatedDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={accesskey('c')}
            />
        {/if}

        <!-- --------------------------------------------------------------------------- -->
        <!--  Done Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if isShownInEditModal.done}
            <DateEditor
                id="done"
                dateSymbol={doneDateSymbol}
                bind:date={editableTask.doneDate}
                bind:isDateValid={isDoneDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={accesskey('x')}
            />
        {/if}

        <!-- --------------------------------------------------------------------------- -->
        <!--  Cancelled Date  -->
        <!-- --------------------------------------------------------------------------- -->
        {#if isShownInEditModal.cancelled}
            <DateEditor
                id="cancelled"
                dateSymbol={cancelledDateSymbol}
                bind:date={editableTask.cancelledDate}
                bind:isDateValid={isCancelledDateValid}
                forwardOnly={editableTask.forwardOnly}
                accesskey={accesskey('-')}
            />
        {/if}
    </section>

    <!--
    The 'mousedown|preventDefault' below stops these buttons needing to be tapped
    twice on mobile.

    While a field has focus, TaskModal.scss adds up to 360px of padding below the
    modal content, so that the sticky button bar can be scrolled clear of the
    software keyboard. WebKit does not give a <button> focus when it is tapped, but
    it does blur the focused text field - so tapping Apply removes that padding
    mid-tap and moves the button bar by several hundred pixels. The button is then no
    longer under the finger, and the browser delivers the click to the <form> rather
    than to the button, making the first tap appear to do nothing.

    Cancelling the default action of 'mousedown' leaves focus where it is, so the
    padding stays and the buttons do not move while they are being tapped. It does
    not affect the click itself, nor keyboard activation.
    -->
    <section class="tasks-modal-button-section">
        <button disabled={!formIsValid} type="submit" class="mod-cta" on:mousedown|preventDefault>Apply </button>
        <button type="button" on:click={_onClose} on:mousedown|preventDefault>Cancel</button>
    </section>
</form>
