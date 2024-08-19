import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import { Task } from '../../Task/Task';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

export class SetTaskDate implements TaskEditingInstruction {
    private readonly newDate: Date;
    private readonly dateFieldToEdit;
    private readonly displayName: string;

    constructor(dateFieldToEdit: AllTaskDateFields, date: Date, displayName?: string) {
        this.newDate = date;
        this.dateFieldToEdit = dateFieldToEdit;
        this.displayName = displayName ?? `Set Date: ${this.newDate.toDateString()}`;
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
        return this.displayName;
    }

    public isCheckedForTask(task: Task): boolean {
        return task[this.dateFieldToEdit]?.isSame(window.moment(this.newDate)) || false;
    }
}
