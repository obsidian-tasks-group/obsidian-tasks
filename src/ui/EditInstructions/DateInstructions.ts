import type { unitOfTime } from 'moment';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import { Task } from '../../Task/Task';
import { postponeMenuItemTitleFromDate, removeDateMenuItemTitleForField } from '../../DateTime/Postponer';
import { TasksDate } from '../../DateTime/TasksDate';
import type { TaskEditingInstruction } from './TaskEditingInstruction';
import { MenuDividerInstruction } from './MenuDividerInstruction';

/**
 * An instruction to set a date field to an absolute date.
 *
 * See also {@link SetRelativeTaskDate} and {@link RemoveTaskDate}.
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
 * See also {@link SetTaskDate} and {@link RemoveTaskDate}.
 */
export class SetRelativeTaskDate extends SetTaskDate {
    constructor(
        dateFieldToEdit: AllTaskDateFields,
        taskDueToday: Task,
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
 * An instruction to remove any value from a date field, if there is a current value.
 *
 * See also {@link SetTaskDate} and {@link SetRelativeTaskDate}.
 */
export class RemoveTaskDate implements TaskEditingInstruction {
    private readonly dateFieldToEdit: AllTaskDateFields;
    private readonly displayName: string;

    constructor(dateFieldToEdit: AllTaskDateFields, task: Task) {
        this.dateFieldToEdit = dateFieldToEdit;
        this.displayName = removeDateMenuItemTitleForField(dateFieldToEdit, task);
    }

    apply(task: Task): Task[] {
        // There's no point trying to remove an inferred scheduled date, as the next time
        // Tasks starts up, it will infer the scheduled date again from the file name,
        // which will be very confusing for users.
        const fieldIsInferred = this.dateFieldToEdit === 'scheduledDate' && task.scheduledDateIsInferred;
        const fieldIsAlreadyNull = task[this.dateFieldToEdit] === null;
        if (fieldIsAlreadyNull || fieldIsInferred) {
            return [task];
        }
        return [
            new Task({
                ...task,
                [this.dateFieldToEdit]: null,
            }),
        ];
    }

    instructionDisplayName(): string {
        return this.displayName;
    }

    isCheckedForTask(_task: Task): boolean {
        return false;
    }
}

/**
 * For Starts, Scheduled, Due.
 * @param field
 * @param task
 * @see allLifeCycleDateInstructions
 */
export function allHappensDateInstructions(field: AllTaskDateFields, task: Task) {
    return allDateInstructions(task, field, 1);
}

/**
 * For Done, Cancelled, Created.
 * @param field
 * @param task
 * @see allHappensDateInstructions
 */
export function allLifeCycleDateInstructions(field: AllTaskDateFields, task: Task) {
    return allDateInstructions(task, field, -1);
}

/**
 * Add instructions to move a date either forwards or backwards
 * @param task
 * @param field
 * @param factor - +1 means today or future dates; -1 = today or earlier dates.
 */
function allDateInstructions(task: Task, field: AllTaskDateFields, factor: number) {
    const today = window.moment().startOf('day');
    const todayAsDate = today.toDate();
    const todayAsTasksDate = new TasksDate(today.clone());

    return [
        new SetTaskDate(field, todayAsDate, postponeMenuItemTitleFromDate(field, today, 0, 'days')),

        // TODO Fix this confusing mixture of Date, Moment and TasksDate!!!
        //      Preferably convert everything to use TasksDate.
        new SetTaskDate(
            field,
            todayAsTasksDate.postpone('day', factor).toDate(),
            postponeMenuItemTitleFromDate(field, today, factor, 'day'),
        ),

        new MenuDividerInstruction(),

        new SetRelativeTaskDate(field, task, factor * 2, 'days'),
        new SetRelativeTaskDate(field, task, factor * 3, 'days'),
        new SetRelativeTaskDate(field, task, factor * 4, 'days'),
        new SetRelativeTaskDate(field, task, factor * 5, 'days'),
        new SetRelativeTaskDate(field, task, factor * 6, 'days'),

        new MenuDividerInstruction(),

        new SetRelativeTaskDate(field, task, factor, 'week'),
        new SetRelativeTaskDate(field, task, factor * 2, 'weeks'),
        new SetRelativeTaskDate(field, task, factor * 3, 'weeks'),
        new SetRelativeTaskDate(field, task, factor, 'month'),

        new MenuDividerInstruction(),

        new RemoveTaskDate(field, task),
    ];
}
