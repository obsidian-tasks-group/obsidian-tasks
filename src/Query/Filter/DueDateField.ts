import type { Task } from '../../Task';
import { Query } from '../../Query';

export class DueDateField {
    private static readonly dueRegexp = /^due (before|after|on)? ?(.*)/;

    public static canCreateFilterForLine(line: string) {
        return DueDateField.dueRegexp.test(line);
    }
    public createFilterOrErrorMessage(line: string, instructionRegexp: RegExp) {
        let filter;
        let error;
        const match = line.match(instructionRegexp);
        if (match !== null) {
            const filterDate = Query.parseDate(match[2]);
            if (!filterDate.isValid()) {
                error = 'do not understand ' + this.fieldName() + ' date';
            } else {
                if (match[1] === 'before') {
                    filter = (task: Task) => {
                        const date = this.date(task);
                        return date ? date.isBefore(filterDate) : false;
                    };
                } else if (match[1] === 'after') {
                    filter = (task: Task) => {
                        const date = this.date(task);
                        return date ? date.isAfter(filterDate) : false;
                    };
                } else {
                    filter = (task: Task) => {
                        const date = this.date(task);
                        return date ? date.isSame(filterDate) : false;
                    };
                }
            }
        } else {
            error =
                'do not understand query filter (' +
                this.fieldName() +
                ' date)';
        }
        return { filter: filter, error };
    }

    private fieldName() {
        return 'due';
    }

    private date(task: Task) {
        return task.dueDate;
    }
}
