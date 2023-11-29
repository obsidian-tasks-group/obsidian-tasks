import type { Task } from '../Task';

export function shouldShowPostponeButton(task: Task) {
    return !task.isDone;
}
