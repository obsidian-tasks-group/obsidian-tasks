import type { Task } from '../../Task';
import { TaskEditingMenu, type TaskSaver, defaultTaskSaver } from './TaskEditingMenu';

export class PostponeMenu extends TaskEditingMenu {
    constructor(_task: Task, taskSaver: TaskSaver = defaultTaskSaver) {
        super(taskSaver);
    }
}
