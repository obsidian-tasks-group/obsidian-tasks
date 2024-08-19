import type { Task } from '../../Task/Task';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import { SetTaskDate } from '../EditInstructions/DateInstructions';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

export class DateMenu extends TaskEditingMenu {
    private readonly field: AllTaskDateFields;

    /**
     * Constructor, which sets up the menu items.
     * @param field - the Date field to edit
     * @param task - the Task to be edited.
     * @param taskSaver - an optional {@link TaskSaver} function. For details, see {@link TaskEditingMenu}.
     */
    constructor(field: AllTaskDateFields, task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        this.field = field;

        const today = new SetTaskDate(this.field, new Date());
        this.addItemsForInstructions([today], task);
    }
}
