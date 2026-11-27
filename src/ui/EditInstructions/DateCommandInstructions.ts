import type { AllTaskDateFields } from 'DateTime/DateFieldTypes';
import { Task } from 'Task/Task';
import { BaseTaskEditingInstruction } from 'ui/EditInstructions/BaseTaskEditingInstruction';
import {
    dateFieldCommandIdText,
    dateFieldCommandNameText,
    signedAmountCommandIdText,
} from 'ui/EditInstructions/DateCommandNames';

/**
 * An instruction to move a date field by an amount, relative to its current value.
 *
 * Tasks without a valid value in the field are left unchanged.
 */
export class MoveTaskDate extends BaseTaskEditingInstruction {
    private readonly dateFieldToEdit: AllTaskDateFields;
    private readonly amount: number;
    private readonly timeUnit: 'day' | 'week';

    constructor(dateFieldToEdit: AllTaskDateFields, amount: number, timeUnit: 'day' | 'week') {
        super();
        this.dateFieldToEdit = dateFieldToEdit;
        this.amount = amount;
        this.timeUnit = timeUnit;
    }

    public apply(task: Task): Task[] {
        const currentDate = task[this.dateFieldToEdit];
        if (currentDate === null || !currentDate.isValid() || this.amount === 0) {
            return [task];
        }
        // Not TasksDate.postpone(), which moves dates before today relative to today, instead of to the current value.
        const newDate = currentDate.clone().add(this.amount, this.timeUnit);
        return [
            new Task({
                ...task,
                [this.dateFieldToEdit]: newDate,
            }),
        ];
    }

    public instructionDisplayName(): string {
        const sign = this.amount >= 0 ? '+' : '-';
        const unit = Math.abs(this.amount) === 1 ? this.timeUnit : `${this.timeUnit}s`;
        return `Move ${dateFieldCommandNameText(this.dateFieldToEdit)} by: ${sign}${Math.abs(this.amount)} ${unit}`;
    }

    public isCheckedForTask(_task: Task): boolean {
        return false;
    }

    public commandId(): string {
        const unit = Math.abs(this.amount) === 1 ? this.timeUnit : `${this.timeUnit}s`;
        return `move-${dateFieldCommandIdText(this.dateFieldToEdit)}-by-${signedAmountCommandIdText(this.amount)}-${unit}`;
    }
}
