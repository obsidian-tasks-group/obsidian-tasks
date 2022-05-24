import type { Moment } from 'moment';
import { Query } from '../../Query';
import type { Task } from '../../Task';
import { Field } from './Field';

export abstract class DateField extends Field {
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
                        return date
                            ? date.isBefore(filterDate)
                            : this.filterResultIfFieldMissing();
                    };
                } else if (match[1] === 'after') {
                    filter = (task: Task) => {
                        const date = this.date(task);
                        return date
                            ? date.isAfter(filterDate)
                            : this.filterResultIfFieldMissing();
                    };
                } else {
                    filter = (task: Task) => {
                        const date = this.date(task);
                        return date
                            ? date.isSame(filterDate)
                            : this.filterResultIfFieldMissing();
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

    protected abstract filterResultIfFieldMissing(): boolean;
}
