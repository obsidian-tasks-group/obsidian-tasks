import { replaceTaskWithTasks } from 'Obsidian/File';
import type { Task } from '../Task/Task';

export const toggleTask = (task: Task): void => {
    const toggledTasks = task.toggleWithRecurrenceInUsersOrder();
    replaceTaskWithTasks({
        originalTask: task,
        newTasks: toggledTasks,
    });
};
