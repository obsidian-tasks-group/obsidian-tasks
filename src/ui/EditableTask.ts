import { GlobalFilter } from '../Config/GlobalFilter';
import { parseTypedDateForSaving } from '../DateTime/DateTools';
import { PriorityTools } from '../lib/PriorityTools';
import { replaceTaskWithTasks } from '../Obsidian/File';
import type { Status } from '../Statuses/Status';
import type { OnCompletion } from '../Task/OnCompletion';
import { Occurrence } from '../Task/Occurrence';
import { Priority } from '../Task/Priority';
import { Recurrence } from '../Task/Recurrence';
import { Task } from '../Task/Task';
import { addDependencyToParent, ensureTaskHasId, generateUniqueId, removeDependency } from '../Task/TaskDependency';
import { StatusType } from '../Statuses/StatusConfiguration';

/**
 * {@link Task} objects are immutable. This class allows to create a mutable object from a {@link Task}, apply the edits,
 * and get the resulting task(s).
 *
 */
export class EditableTask {
    private readonly addGlobalFilterOnSave: boolean;
    private readonly originalBlocking: Task[];

    // NEW_TASK_FIELD_EDIT_REQUIRED
    description: string;
    status: Status;
    priority: string;
    recurrenceRule: string;
    onCompletion: OnCompletion;
    createdDate: string;
    startDate: string;
    scheduledDate: string;
    dueDate: string;
    doneDate: string;
    cancelledDate: string;
    forwardOnly: boolean;
    blockedBy: Task[];
    blocking: Task[];

    private constructor(editableTask: {
        addGlobalFilterOnSave: boolean;
        originalBlocking: Task[];

        // NEW_TASK_FIELD_EDIT_REQUIRED
        description: string;
        status: Status;
        priority: string;
        onCompletion: OnCompletion;
        recurrenceRule: string;
        createdDate: string;
        startDate: string;
        scheduledDate: string;
        dueDate: string;
        doneDate: string;
        cancelledDate: string;
        forwardOnly: boolean;
        blockedBy: Task[];
        blocking: Task[];
    }) {
        this.addGlobalFilterOnSave = editableTask.addGlobalFilterOnSave;
        this.originalBlocking = editableTask.originalBlocking;

        this.description = editableTask.description;
        this.status = editableTask.status;
        this.priority = editableTask.priority;
        this.onCompletion = editableTask.onCompletion;
        this.recurrenceRule = editableTask.recurrenceRule;
        this.createdDate = editableTask.createdDate;
        this.startDate = editableTask.startDate;
        this.scheduledDate = editableTask.scheduledDate;
        this.dueDate = editableTask.dueDate;
        this.doneDate = editableTask.doneDate;
        this.cancelledDate = editableTask.cancelledDate;
        this.forwardOnly = editableTask.forwardOnly;
        this.blockedBy = editableTask.blockedBy;
        this.blocking = editableTask.blocking;
    }

    /**
     * Use this factory to create an editable task from a {@link Task} object.
     *
     * @param task
     * @param allTasks
     */
    public static fromTask(task: Task, allTasks: Task[]): EditableTask {
        const description = GlobalFilter.getInstance().removeAsWordFrom(task.description);
        // If we're displaying to the user the description without the global filter (i.e. it was removed in the method
        // above), or if the description did not include a global filter in the first place, we'll add the global filter
        // when saving the task.
        const addGlobalFilterOnSave =
            description != task.description || !GlobalFilter.getInstance().includedIn(task.description);

        let priority = 'none';
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

        const originalBlocking = allTasks.filter((cacheTask) => cacheTask.dependsOn.includes(task.id));

        return new EditableTask({
            addGlobalFilterOnSave,
            originalBlocking,

            // NEW_TASK_FIELD_EDIT_REQUIRED
            description,
            status: task.status,
            priority,
            recurrenceRule: task.recurrence ? task.recurrence.toText() : '',
            onCompletion: task.onCompletion,
            createdDate: task.created.formatAsDate(),
            startDate: task.start.formatAsDate(),
            scheduledDate: task.scheduled.formatAsDate(),
            dueDate: task.due.formatAsDate(),
            doneDate: task.done.formatAsDate(),
            cancelledDate: task.cancelled.formatAsDate(),
            forwardOnly: true,
            blockedBy: blockedBy,
            blocking: originalBlocking,
        });
    }

    /**
     * Generates a {@link Task} object from the current {@link EditableTask}. Use this to output the new tasks after the edits.
     *
     * There are cases where the output of the edits is more than one task, for example, completing a {@link Task} with {@link Recurrence}.
     *
     * @param task
     * @param allTasks
     */
    public async applyEdits(task: Task, allTasks: Task[]): Promise<Task[]> {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        let description = this.description.trim();
        if (this.addGlobalFilterOnSave) {
            description = GlobalFilter.getInstance().prependTo(description);
        }

        const startDate = parseTypedDateForSaving(this.startDate, this.forwardOnly);
        const scheduledDate = parseTypedDateForSaving(this.scheduledDate, this.forwardOnly);
        const dueDate = parseTypedDateForSaving(this.dueDate, this.forwardOnly);

        const cancelledDate = parseTypedDateForSaving(this.cancelledDate, this.forwardOnly);
        const createdDate = parseTypedDateForSaving(this.createdDate, this.forwardOnly);
        const doneDate = parseTypedDateForSaving(this.doneDate, this.forwardOnly);

        let recurrence: Recurrence | null = null;
        if (this.recurrenceRule) {
            recurrence = Recurrence.fromText({
                recurrenceRuleText: this.recurrenceRule,
                occurrence: new Occurrence({ startDate, scheduledDate, dueDate }),
            });
        }

        const parsedOnCompletion: OnCompletion = this.onCompletion;

        const blockedByWithIds = [];

        for (const depTask of this.blockedBy) {
            const newDep = await serialiseTaskId(depTask, allTasks);
            blockedByWithIds.push(newDep);
        }

        let id = task.id;
        let removedBlocking: Task[] = [];
        let addedBlocking: Task[] = [];

        if (this.blocking.toString() !== this.originalBlocking.toString() || this.blocking.length !== 0) {
            if (task.id === '') {
                id = generateUniqueId(allTasks.filter((task) => task.id !== '').map((task) => task.id));
            }

            removedBlocking = this.originalBlocking.filter((task) => !this.blocking.includes(task));

            addedBlocking = this.blocking.filter((task) => !this.originalBlocking.includes(task));
        }

        // First create an updated task, with all edits except Status:
        const updatedTask = new Task({
            // NEW_TASK_FIELD_EDIT_REQUIRED
            ...task,
            description,
            status: task.status,
            priority: PriorityTools.priorityValue(this.priority),
            onCompletion: parsedOnCompletion,
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
        const today = this.inferTodaysDate(this.status.type, doneDate, cancelledDate);
        return updatedTask.handleNewStatusWithRecurrenceInUsersOrder(this.status, today);
    }

    /**
     * If the user has manually edited the Done date or Cancelled date in the modal,
     * we need to tell Tasks to use a different `today` value in the status-editing code.
     * Here we calculate that inferred date.
     */
    private inferTodaysDate(
        newStatusType: StatusType,
        doneDate: moment.Moment | null,
        cancelledDate: moment.Moment | null,
    ) {
        if (newStatusType === StatusType.DONE && doneDate !== null) {
            // The status type of the edited task is DONE, so we need to preserve the
            // Done Date value in the modal as today's date,
            // for use in later code.
            // This is needed for scenarios including:
            //  - The task already had a done date before being edited
            //  - The user changed the status to Done, and then edited the machine-generted done date.
            return doneDate;
        }

        if (newStatusType === StatusType.CANCELLED && cancelledDate !== null) {
            // The status type of the edited task is CANCELLED, so we need to preserve the
            // Cancelled Date value in the modal as today's date.
            return cancelledDate;
        }

        // Otherwise, use the current date.
        return window.moment();
    }

    public parseAndValidateRecurrence() {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        if (!this.recurrenceRule) {
            return { parsedRecurrence: '<i>not recurring</>', isRecurrenceValid: true };
        }

        const recurrenceFromText = Recurrence.fromText({
            recurrenceRuleText: this.recurrenceRule,
            // Only for representation in the modal, no dates required.
            occurrence: new Occurrence({ startDate: null, scheduledDate: null, dueDate: null }),
        })?.toText();

        if (!recurrenceFromText) {
            return { parsedRecurrence: '<i>invalid recurrence rule</i>', isRecurrenceValid: false };
        }

        if (this.startDate || this.scheduledDate || this.dueDate) {
            return { parsedRecurrence: recurrenceFromText, isRecurrenceValid: true };
        }

        return { parsedRecurrence: '<i>due, scheduled or start date required</i>', isRecurrenceValid: false };
    }
}

async function serialiseTaskId(task: Task, allTasks: Task[]) {
    if (task.id !== '') return task;

    const tasksWithId = allTasks.filter((task) => task.id !== '');

    const updatedTask = ensureTaskHasId(
        task,
        tasksWithId.map((task) => task.id),
    );

    await replaceTaskWithTasks({ originalTask: task, newTasks: updatedTask });

    return updatedTask;
}
