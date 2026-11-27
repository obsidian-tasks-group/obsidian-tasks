import type { AllTaskDateFields } from 'DateTime/DateFieldTypes';
import { StatusType } from 'Statuses/StatusConfiguration';
import { Task } from 'Task/Task';
import { BaseTaskEditingInstruction } from 'ui/EditInstructions/BaseTaskEditingInstruction';
import type { TaskEditingInstruction } from 'ui/EditInstructions/TaskEditingInstruction';
import {
    dateFieldCommandIdText,
    dateFieldCommandNameText,
    signedAmountCommandIdText,
} from 'ui/EditInstructions/DateCommandNames';

/**
 * Whether {@link SetTaskDateRelativeToToday} sets the date on every task,
 * or only on tasks that have no value in the field.
 */
export type SetDateWhen = 'always' | 'if_missing';

/**
 * An instruction to set a date field to a date relative to today,
 * where today is computed each time the instruction is applied, not when it is constructed.
 *
 * This allows it to be used in commands that are created when the plugin loads,
 * and may be run days later.
 *
 * With {@link SetDateWhen} `'if_missing'`, tasks that already have a value in the field are left unchanged.
 *
 * See also {@link SetTaskDate}, which uses a fixed date.
 */
export class SetTaskDateRelativeToToday extends BaseTaskEditingInstruction {
    private readonly dateFieldToEdit: AllTaskDateFields;
    private readonly daysFromToday: number;
    private readonly when: SetDateWhen;

    constructor(dateFieldToEdit: AllTaskDateFields, daysFromToday: number, when: SetDateWhen) {
        super();
        this.dateFieldToEdit = dateFieldToEdit;
        this.daysFromToday = daysFromToday;
        this.when = when;
    }

    public apply(task: Task): Task[] {
        if (this.isCheckedForTask(task)) {
            return [task];
        }
        if (this.when === 'if_missing' && task[this.dateFieldToEdit] !== null) {
            return [task];
        }
        return [
            new Task({
                ...task,
                [this.dateFieldToEdit]: this.newDate(),
            }),
        ];
    }

    public instructionDisplayName(): string {
        const fieldName = dateFieldCommandNameText(this.dateFieldToEdit);
        if (this.when === 'if_missing') {
            return `Add ${fieldName}: ${this.relativeDayName()}`;
        }
        return `Change ${fieldName} to: ${this.relativeDayName()}`;
    }

    public isCheckedForTask(task: Task): boolean {
        return task[this.dateFieldToEdit]?.isSame(this.newDate(), 'day') || false;
    }

    public commandId(): string {
        const suffix = this.daysFromToday === 0 ? '' : `-${signedAmountCommandIdText(this.daysFromToday)}-day`;
        const fieldId = dateFieldCommandIdText(this.dateFieldToEdit);
        if (this.when === 'if_missing') {
            return `add-${fieldId}-today${suffix}`;
        }
        return `set-${fieldId}-to-today${suffix}`;
    }

    private newDate() {
        return window.moment().startOf('day').add(this.daysFromToday, 'days');
    }

    private relativeDayName() {
        switch (this.daysFromToday) {
            case 0:
                return 'Today';
            case 1:
                return 'Tomorrow';
            case -1:
                return 'Yesterday';
            default:
                return `Today ${this.daysFromToday > 0 ? '+' : ''}${this.daysFromToday} days`;
        }
    }
}

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

/**
 * Whether a task's status allows the given date field to be edited by a command.
 *
 * Done dates may only be edited on done tasks.
 * All other date fields may be edited on any task.
 */
export function statusAllowsEditingDateField(field: AllTaskDateFields, task: Task): boolean {
    switch (field) {
        case 'doneDate':
            return task.status.type === StatusType.DONE;
        default:
            return true;
    }
}

/**
 * Wraps a date editing instruction, so that it leaves unchanged any tasks
 * whose status does not allow the date field to be edited.
 *
 * See {@link statusAllowsEditingDateField}.
 */
export class OnlyIfStatusAllowsEditingDate implements TaskEditingInstruction {
    private readonly dateFieldToEdit: AllTaskDateFields;
    private readonly instruction: TaskEditingInstruction;

    constructor(dateFieldToEdit: AllTaskDateFields, instruction: TaskEditingInstruction) {
        this.dateFieldToEdit = dateFieldToEdit;
        this.instruction = instruction;
    }

    public apply(task: Task): Task[] {
        if (!statusAllowsEditingDateField(this.dateFieldToEdit, task)) {
            return [task];
        }
        return this.instruction.apply(task);
    }

    public instructionDisplayName(): string {
        return this.instruction.instructionDisplayName();
    }

    public isCheckedForTask(task: Task): boolean {
        return this.instruction.isCheckedForTask(task);
    }

    public commandId(): string {
        return this.instruction.commandId();
    }
}
