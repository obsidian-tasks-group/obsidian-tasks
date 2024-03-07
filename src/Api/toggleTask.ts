import { replaceTaskWithTasks } from 'Obsidian/File';
import type { Task } from '../Task/Task';

export const toggleTask = async (task: Task): Promise<Task[]> => {
    const toggledTasks = task.toggleWithRecurrenceInUsersOrder();

    await replaceTaskWithTasks({
        originalTask: task,
        newTasks: toggledTasks,
    });

    return toggledTasks;
};
