import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateParser } from '../DateParser';
import { Sort } from '../../Sort';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

/**
 * Support the 'happens' search instruction, which searches all of
 * start, scheduled and due dates.
 */
export class HappensDateField extends Field {
    private static readonly happensRegexp = /^happens (before|after|on)? ?(.*)/;
    private static readonly instructionForFieldPresence = 'has happens date';
    private static readonly instructionForFieldAbsence = 'no happens date';

    public canCreateFilterForLine(line: string): boolean {
        if (line === HappensDateField.instructionForFieldPresence) {
            return true;
        }
        if (line === HappensDateField.instructionForFieldAbsence) {
            return true;
        }
        return super.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();

        if (line === HappensDateField.instructionForFieldPresence) {
            const result = new FilterOrErrorMessage();
            result.filter = (task: Task) =>
                this.dates(task).some((date) => date !== null);
            return result;
        }

        if (line === HappensDateField.instructionForFieldAbsence) {
            const result = new FilterOrErrorMessage();
            result.filter = (task: Task) =>
                !this.dates(task).some((date) => date !== null);
            return result;
        }

        const happensMatch = Field.getMatch(this.filterRegexp(), line);
        if (happensMatch !== null) {
            const filterDate = DateParser.parseDate(happensMatch[2]);
            if (!filterDate.isValid()) {
                result.error = 'do not understand happens date';
            } else {
                if (happensMatch[1] === 'before') {
                    result.filter = (task: Task) => {
                        return this.dates(task).some(
                            (date) => date && date.isBefore(filterDate),
                        );
                    };
                } else if (happensMatch[1] === 'after') {
                    result.filter = (task: Task) => {
                        return this.dates(task).some(
                            (date) => date && date.isAfter(filterDate),
                        );
                    };
                } else {
                    result.filter = (task: Task) => {
                        return this.dates(task).some(
                            (date) => date && date.isSame(filterDate),
                        );
                    };
                }
            }
        } else {
            result.error = 'do not understand query filter (happens date)';
        }
        return result;
    }

    /**
     * Return the earliest of the dates used by 'happens' in the given task, or null if none set.
     *
     * Generally speaking, the earliest date is considered to be the highest priority,
     * as it is the first point at which the user might wish to act on the task.
     * @param task
     */
    public earliestDate(task: Task): Moment | null {
        const happensDates = new HappensDateField().dates(task);
        const sortedHappensDates = happensDates.sort(Sort.compareByDate);
        return sortedHappensDates[0];
    }

    protected filterRegexp(): RegExp {
        return HappensDateField.happensRegexp;
    }

    /**
     * Return the task's start, scheduled and due dates, any or all of which may be null.
     */
    public dates(task: Task): (Moment | null)[] {
        return Array.of(task.startDate, task.scheduledDate, task.dueDate);
    }

    public fieldName(): string {
        return 'happens';
    }
}
