import type { Moment } from 'moment';
import type { Task } from '../../Task';
import type { Comparator } from '../Sorter';
import { compareByDate } from '../../lib/DateTools';
import type { FilterFunction } from './Filter';
import { FilterInstructions } from './FilterInstructions';
import type { DateFilterFunction } from './DateField';
import { DateField } from './DateField';

/**
 * Support the 'happens' search instruction, which searches all of
 * start, scheduled and due dates.
 */
export class HappensDateField extends DateField {
    private static readonly happensRegexp = /^happens (before|after|on)? ?(.*)/;
    private static readonly instructionForFieldPresence = 'has happens date';
    private static readonly instructionForFieldAbsence = 'no happens date';

    constructor() {
        const filterInstructions = new FilterInstructions();
        filterInstructions.add(HappensDateField.instructionForFieldPresence, (task: Task) =>
            this.dates(task).some((date) => date !== null),
        );
        filterInstructions.add(
            HappensDateField.instructionForFieldAbsence,
            (task: Task) => !this.dates(task).some((date) => date !== null),
        );
        super(filterInstructions);
    }

    protected filterRegExp(): RegExp {
        return HappensDateField.happensRegexp;
    }
    public fieldName(): string {
        return 'happens';
    }
    public date(): Moment | null {
        return null;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }

    protected getFilter(dateFilterFunction: DateFilterFunction): FilterFunction {
        return (task: Task) => {
            return this.dates(task).some((date) => dateFilterFunction(date));
        };
    }

    /**
     * Return the task's start, scheduled and due dates, any or all of which may be null.
     */
    public dates(task: Task): (Moment | null)[] {
        return Array.of(task.startDate, task.scheduledDate, task.dueDate);
    }

    protected fieldNameForExplanation() {
        return 'due, start or scheduled';
    }

    /**
     * This sorts on the earliest of start, scheduled and due dates.
     */
    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return compareByDate(this.earliestDate(a), this.earliestDate(b));
        };
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
        const sortedHappensDates = happensDates.sort(compareByDate);
        return sortedHappensDates[0];
    }
}
