import { GlobalFilter } from '../Config/GlobalFilter';
import { parseTypedDateForSaving } from '../lib/DateTools';
import { replaceTaskWithTasks } from '../Obsidian/File';
import type { Status } from '../Statuses/Status';
import { Priority } from '../Task/Priority';
import { Recurrence } from '../Task/Recurrence';
import { Task } from '../Task/Task';
import { addDependencyToParent, ensureTaskHasId, generateUniqueId, removeDependency } from '../Task/TaskDependency';

export class EditableTask {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    description: string;
    status: Status;
    priority: 'none' | 'lowest' | 'low' | 'medium' | 'high' | 'highest';
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

    constructor(editableTask: {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        description: string;
        status: Status;
        priority: 'none' | 'lowest' | 'low' | 'medium' | 'high' | 'highest';
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
        this.description = editableTask.description;
        this.status = editableTask.status;
        this.priority = editableTask.priority;
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
}

export async function applyEdits(
    editableTask: EditableTask,
    task: Task,
    originalBlocking: Task[],
    addGlobalFilterOnSave: boolean,
    allTasks: Task[],
) {
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

    const blockedByWithIds = [];

    for (const depTask of editableTask.blockedBy) {
        const newDep = await serialiseTaskId(depTask, allTasks);
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
    return updatedTask.handleNewStatusWithRecurrenceInUsersOrder(editableTask.status, today);
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
