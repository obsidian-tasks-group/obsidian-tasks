import type { Task } from '../../Task/Task';
import type { AllTaskDateFields } from '../../DateTime/DateFieldTypes';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

export class DateMenu extends TaskEditingMenu {
    // @ts-expect-error Unused
    private field: AllTaskDateFields;

    /**
     * Constructor, which sets up the menu items.
     * @param field - the Date field to edit
     * @param _task - the Task to be edited.
     * @param taskSaver - an optional {@link TaskSaver} function. For details, see {@link TaskEditingMenu}.
     */
    constructor(field: AllTaskDateFields, _task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);

        this.field = field;
    }
}
