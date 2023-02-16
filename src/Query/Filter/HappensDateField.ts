import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateParser } from '../DateParser';
import { Explanation } from '../Explain/Explanation';
import type { Comparator } from '../Sorter';
import { compareByDate } from '../../lib/DateTools';
import { Field } from './Field';
import { Filter, FilterOrErrorMessage } from './Filter';
import { FilterInstructions } from './FilterInstructions';
import { DateField } from './DateField';

/**
 * Support the 'happens' search instruction, which searches all of
 * start, scheduled and due dates.
 */
export class HappensDateField extends Field {
    private static readonly happensRegexp = /^happens (before|after|on)? ?(.*)/;
    private static readonly instructionForFieldPresence = 'has happens date';
    private static readonly instructionForFieldAbsence = 'no happens date';
    private readonly filterInstructions: FilterInstructions;

    constructor() {
        super();
        this.filterInstructions = new FilterInstructions();
        this.filterInstructions.add(HappensDateField.instructionForFieldPresence, (task: Task) =>
            this.dates(task).some((date) => date !== null),
        );
        this.filterInstructions.add(
            HappensDateField.instructionForFieldAbsence,
            (task: Task) => !this.dates(task).some((date) => date !== null),
        );
    }

    public canCreateFilterForLine(line: string): boolean {
        if (this.filterInstructions.canCreateFilterForLine(line)) {
            return true;
        }
        return super.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const filterResult = this.filterInstructions.createFilterOrErrorMessage(line);
        if (filterResult.filter !== undefined) {
            return filterResult;
        }

        const result = new FilterOrErrorMessage(line);

        const fieldNameKeywordDate = Field.getMatch(this.filterRegExp(), line);
        if (fieldNameKeywordDate !== null) {
            const fieldKeyword = fieldNameKeywordDate[1];
            const filterDate = DateParser.parseDate(fieldNameKeywordDate[2]);
            if (!filterDate.isValid()) {
                result.error = 'do not understand happens date';
            } else {
                let filterFunction;
                if (fieldKeyword === 'before') {
                    filterFunction = (task: Task) => {
                        return this.dates(task).some((date) => date && date.isBefore(filterDate));
                    };
                } else if (fieldKeyword === 'after') {
                    filterFunction = (task: Task) => {
                        return this.dates(task).some((date) => date && date.isAfter(filterDate));
                    };
                } else {
                    filterFunction = (task: Task) => {
                        return this.dates(task).some((date) => date && date.isSame(filterDate));
                    };
                }

                const explanation = DateField.buildExplanation(
                    'due, start or scheduled',
                    fieldKeyword,
                    false,
                    filterDate,
                );
                result.filter = new Filter(line, filterFunction, new Explanation(explanation));
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
        const sortedHappensDates = happensDates.sort(compareByDate);
        return sortedHappensDates[0];
    }

    protected filterRegExp(): RegExp {
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

    public supportsSorting(): boolean {
        return true;
    }

    /**
     * This sorts on the earliest of start, scheduled and due dates.
     */
    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return compareByDate(this.earliestDate(a), this.earliestDate(b));
        };
    }
}
