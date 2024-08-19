import type { Task } from '../../Task/Task';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

export class DateMenu extends TaskEditingMenu {
    /**
     * Constructor, which sets up the menu items.
     * @param _task - the Task to be edited.
     * @param taskSaver - an optional {@link TaskSaver} function. For details, see {@link TaskEditingMenu}.
     */
    constructor(_task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);
    }
}
