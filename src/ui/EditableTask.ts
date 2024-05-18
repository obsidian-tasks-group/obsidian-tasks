import { GlobalFilter } from '../Config/GlobalFilter';
import { parseTypedDateForSaving } from '../lib/DateTools';
import { replaceTaskWithTasks } from '../Obsidian/File';
import { TasksDate } from '../Scripting/TasksDate';
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

    public async applyEdits(task: Task, originalBlocking: Task[], addGlobalFilterOnSave: boolean, allTasks: Task[]) {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        let description = this.description.trim();
        if (addGlobalFilterOnSave) {
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
                startDate,
                scheduledDate,
                dueDate,
            });
        }

        let parsedPriority: Priority;
        switch (this.priority) {
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

        for (const depTask of this.blockedBy) {
            const newDep = await serialiseTaskId(depTask, allTasks);
            blockedByWithIds.push(newDep);
        }

        let id = task.id;
        let removedBlocking: Task[] = [];
        let addedBlocking: Task[] = [];

        if (this.blocking.toString() !== originalBlocking.toString() || this.blocking.length !== 0) {
            if (task.id === '') {
                id = generateUniqueId(allTasks.filter((task) => task.id !== '').map((task) => task.id));
            }

            removedBlocking = originalBlocking.filter((task) => !this.blocking.includes(task));

            addedBlocking = this.blocking.filter((task) => !originalBlocking.includes(task));
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
        return updatedTask.handleNewStatusWithRecurrenceInUsersOrder(this.status, today);
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

export function fromTask(task: Task, allTasks: Task[], editableTask: EditableTask) {
    const description = GlobalFilter.getInstance().removeAsWordFrom(task.description);
    // If we're displaying to the user the description without the global filter (i.e. it was removed in the method
    // above), or if the description did not include a global filter in the first place, we'll add the global filter
    // when saving the task.
    let addGlobalFilterOnSave = false;
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

    const originalBlocking = allTasks.filter((cacheTask) => cacheTask.dependsOn.includes(task.id));

    return {
        editableTask: new EditableTask({
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
        }),
        addGlobalFilterOnSave,
        originalBlocking,
    };
}
