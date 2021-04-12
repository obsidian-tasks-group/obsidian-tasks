import { Task } from '../Task';

export class Sort {
    public static byDateThenPath(tasks: Task[]) {
        const sortedTasks = tasks.sort(Sort.compareByDate);

        return sortedTasks;
    }

    private static compareByDate(a: Task, b: Task): -1 | 0 | 1 {
        if (a.dueDate !== undefined && b.dueDate === undefined) {
            return -1;
        } else if (a.dueDate === undefined && b.dueDate !== undefined) {
            return 1;
        } else if (a.dueDate !== undefined && b.dueDate !== undefined) {
            if (a.dueDate.isAfter(b.dueDate)) {
                return 1;
            } else if (a.dueDate.isBefore(b.dueDate)) {
                return -1;
            } else {
                return Sort.compareByPath(a, b);
            }
        } else {
            return Sort.compareByPath(a, b);
        }
    }

    private static compareByPath(a: Task, b: Task): -1 | 0 | 1 {
        if (a.path < b.path) {
            return -1;
        } else if (a.path > b.path) {
            return 1;
        } else {
            return 0;
        }
    }
}
