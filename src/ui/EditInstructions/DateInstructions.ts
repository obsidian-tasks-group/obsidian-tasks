import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import { Task } from '../../Task/Task';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

export class SetTaskDate implements TaskEditingInstruction {
    private readonly newDate: Date;
    private readonly dateFieldToEdit;

    constructor(dateFieldToEdit: AllTaskDateFields, date: Date) {
        this.newDate = date;
        this.dateFieldToEdit = dateFieldToEdit;
    }

    public apply(task: Task): Task[] {
        if (this.isCheckedForTask(task)) {
            return [task];
        } else {
            return [
                new Task({
                    ...task,
                    [this.dateFieldToEdit]: window.moment(this.newDate),
                }),
            ];
        }
    }

    public instructionDisplayName(): string {
        return `Set Date: ${this.newDate.toDateString()}`;
    }

    public isCheckedForTask(task: Task): boolean {
        return task[this.dateFieldToEdit]?.isSame(window.moment(this.newDate)) || false;
    }
}
