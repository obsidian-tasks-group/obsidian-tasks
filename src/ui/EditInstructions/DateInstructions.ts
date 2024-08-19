import type { unitOfTime } from 'moment';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import { Task } from '../../Task/Task';
import { postponeMenuItemTitleFromDate } from '../../DateTime/Postponer';
import { TasksDate } from '../../DateTime/TasksDate';
import type { TaskEditingInstruction } from './TaskEditingInstruction';

/**
 * An instruction to set a date field to an absolute date.
 *
 * See also {@link SetRelativeTaskDate}.
 */
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

/**
 * An instruction to set a date field to a date relative to the current value, or
 * relative to today, if there is no current value.
 *
 * See also {@link SetTaskDate}.
 */
export class SetRelativeTaskDate extends SetTaskDate {
    constructor(
        taskDueToday: Task,
        dateFieldToEdit: AllTaskDateFields,
        amount: number,
        timeUnit: unitOfTime.DurationConstructor,
    ) {
        const currentDate = taskDueToday[dateFieldToEdit] ?? window.moment();
        const title = postponeMenuItemTitleFromDate(dateFieldToEdit, currentDate, amount, timeUnit);

        const newDate = new TasksDate(window.moment(currentDate)).postpone(timeUnit, amount).toDate();
        super(dateFieldToEdit, newDate, title);
    }
}

/**
 * For Starts, Scheduled, Due.
 * @param field
 * @param task
 * @see allLifeCycleDateInstructions
 */
export function allHappensDateInstructions(field: AllTaskDateFields, task: Task) {
    return [
        // TODO Add Today and Tomorrow

        new SetRelativeTaskDate(task, field, 2, 'days'),
        new SetRelativeTaskDate(task, field, 3, 'days'),
        new SetRelativeTaskDate(task, field, 4, 'days'),
        new SetRelativeTaskDate(task, field, 5, 'days'),
        new SetRelativeTaskDate(task, field, 6, 'days'),

        // TODO Add a dividing line

        new SetRelativeTaskDate(task, field, 1, 'week'),
        new SetRelativeTaskDate(task, field, 2, 'weeks'),
        new SetRelativeTaskDate(task, field, 3, 'weeks'),
        new SetRelativeTaskDate(task, field, 1, 'month'),

        // TODO Add Clear
    ];
}

/**
 * For Done, Cancelled, Created.
 * @param field
 * @param task
 * @see allHappensDateInstructions
 */
export function allLifeCycleDateInstructions(field: AllTaskDateFields, task: Task) {
    return [
        // TODO Add Today and Yesterday

        new SetRelativeTaskDate(task, field, -2, 'days'),
        new SetRelativeTaskDate(task, field, -3, 'days'),
        new SetRelativeTaskDate(task, field, -4, 'days'),
        new SetRelativeTaskDate(task, field, -5, 'days'),
        new SetRelativeTaskDate(task, field, -6, 'days'),

        // TODO Add a dividing line

        new SetRelativeTaskDate(task, field, -1, 'week'),
        new SetRelativeTaskDate(task, field, -2, 'weeks'),
        new SetRelativeTaskDate(task, field, -3, 'weeks'),
        new SetRelativeTaskDate(task, field, -1, 'month'),

        // TODO Add Clear
    ];
}
