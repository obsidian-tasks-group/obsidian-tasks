import { Task } from '../Task/Task';

export const mapObjToTasks = (objTasks: Task[]): Task[] => {
    return objTasks.map((t) => new Task({ ...t }));
};
