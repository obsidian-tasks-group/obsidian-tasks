import type { Task } from '../../Task';
import { Query } from '../../Query';

export class DueDateField {
    public createDueFilterOrErrorMessage(
        line: string,
        instructionRegexp: RegExp,
    ) {
        let filter;
        let error;
        const dueMatch = line.match(instructionRegexp);
        if (dueMatch !== null) {
            const filterDate = Query.parseDate(dueMatch[2]);
            if (!filterDate.isValid()) {
                error = 'do not understand due date';
            } else {
                if (dueMatch[1] === 'before') {
                    filter = (task: Task) =>
                        task.dueDate
                            ? task.dueDate.isBefore(filterDate)
                            : false;
                } else if (dueMatch[1] === 'after') {
                    filter = (task: Task) =>
                        task.dueDate ? task.dueDate.isAfter(filterDate) : false;
                } else {
                    filter = (task: Task) =>
                        task.dueDate ? task.dueDate.isSame(filterDate) : false;
                }
            }
        } else {
            error = 'do not understand query filter (due date)';
        }
        return { filter: filter, error };
    }
}
