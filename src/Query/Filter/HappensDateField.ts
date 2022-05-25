import type { Task } from '../../Task';
import { Query } from '../../Query';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

export class HappensDateField extends Field {
    private static readonly happensRegexp = /^happens (before|after|on)? ?(.*)/;

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        const happensMatch = line.match(this.filterRegexp());
        if (happensMatch !== null) {
            const filterDate = Query.parseDate(happensMatch[2]);
            if (!filterDate.isValid()) {
                result.error = 'do not understand happens date';
            } else {
                if (happensMatch[1] === 'before') {
                    result.filter = (task: Task) => {
                        return Array.of(
                            task.startDate,
                            task.scheduledDate,
                            task.dueDate,
                        ).some((date) => date && date.isBefore(filterDate));
                    };
                } else if (happensMatch[1] === 'after') {
                    result.filter = (task: Task) => {
                        return Array.of(
                            task.startDate,
                            task.scheduledDate,
                            task.dueDate,
                        ).some((date) => date && date.isAfter(filterDate));
                    };
                } else {
                    result.filter = (task: Task) => {
                        return Array.of(
                            task.startDate,
                            task.scheduledDate,
                            task.dueDate,
                        ).some((date) => date && date.isSame(filterDate));
                    };
                }
            }
        } else {
            result.error = 'do not understand query filter (happens date)';
        }
        return result;
    }

    protected filterRegexp(): RegExp {
        return HappensDateField.happensRegexp;
    }

    protected fieldName(): string {
        return 'happens';
    }
}
