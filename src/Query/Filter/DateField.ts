import type { Moment } from 'moment';
import { Query } from '../../Query';
import type { Task } from '../../Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

export abstract class DateField extends Field {
    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        const match = line.match(this.filterRegexp());
        if (match !== null) {
            const filterDate = Query.parseDate(match[2]);
            if (!filterDate.isValid()) {
                result.error =
                    'do not understand ' + this.fieldName() + ' date';
            } else {
                if (match[1] === 'before') {
                    result.filter = (task: Task) => {
                        const date = this.date(task);
                        return date
                            ? date.isBefore(filterDate)
                            : this.filterResultIfFieldMissing();
                    };
                } else if (match[1] === 'after') {
                    result.filter = (task: Task) => {
                        const date = this.date(task);
                        return date
                            ? date.isAfter(filterDate)
                            : this.filterResultIfFieldMissing();
                    };
                } else {
                    result.filter = (task: Task) => {
                        const date = this.date(task);
                        return date
                            ? date.isSame(filterDate)
                            : this.filterResultIfFieldMissing();
                    };
                }
            }
        } else {
            result.error =
                'do not understand query filter (' +
                this.fieldName() +
                ' date)';
        }
        return result;
    }

    protected abstract date(task: Task): Moment | null;

    protected abstract filterResultIfFieldMissing(): boolean;
}
