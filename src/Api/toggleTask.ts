import { replaceTaskWithTasks } from 'Obsidian/File';
import { Task } from '../Task/Task';

export const toggleTask = async (task: Task): Promise<Task[]> => {
    const newTask = new Task({ ...task });
    const toggledTasks = newTask.toggleWithRecurrenceInUsersOrder();

    await replaceTaskWithTasks({
        originalTask: task,
        newTasks: toggledTasks,
    });

    return toggledTasks;
};
