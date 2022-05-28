import type { Moment } from 'moment';
import { Query } from '../../Query';
import type { Task } from '../../Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

/**
 * DateField is an abstract base class to help implement
 * all the filter instructions that act on a single type of date
 * value, such as the done date.
 */
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

    /**
     * Return the task's value for this date field, if any.
     * @param task - a Task object
     * @protected
     */
    protected abstract date(task: Task): Moment | null;

    /**
     * Determine whether a task that does not have the particular date value
     * should be treated as a match. For example, 'starts' searches match all tasks
     * that have no start date, which behaves differently from 'due', 'done' and
     * 'scheduled' searches.
     * @protected
     */
    protected abstract filterResultIfFieldMissing(): boolean;
}
