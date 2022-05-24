import type { Moment } from 'moment';
import { Query } from '../../Query';
import type { Task } from '../../Task';

export abstract class DateField {
    public abstract canCreateFilterForLine(line: string): boolean;

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

    protected abstract filterRegexp(): RegExp;

    protected abstract fieldName(): string;

    protected abstract date(task: Task): Moment | null;
}
