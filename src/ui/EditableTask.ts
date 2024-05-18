import type { Status } from '../Statuses/Status';
import type { Task } from '../Task/Task';

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
