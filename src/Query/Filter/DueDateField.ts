import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { Query } from '../../Query';

export class DueDateField {
    private static readonly dueRegexp = /^due (before|after|on)? ?(.*)/;

    public canCreateFilterForLine(line: string): boolean {
        return this.filterRegexp().test(line);
    }
    public createFilterOrErrorMessage(line: string) {
        let filter;
        let error;
        const match = line.match(this.filterRegexp());
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

    private filterRegexp(): RegExp {
        return DueDateField.dueRegexp;
    }

    private fieldName(): string {
        return 'due';
    }

    private date(task: Task): Moment | null {
        return task.dueDate;
    }
}
