import type { Moment } from 'moment';
import { DateRange } from '../DateRange';
import type { Task } from '../../Task';
import { DateParser } from '../DateParser';
import { Explanation } from '../Explain/Explanation';
import type { Comparator } from '../Sorter';
import { compareByDate } from '../../lib/DateTools';
import type { GrouperFunction } from '../Grouper';
import { Field } from './Field';
import { Filter, type FilterFunction, FilterOrErrorMessage } from './Filter';
import { FilterInstructions } from './FilterInstructions';

export type DateFilterFunction = (date: Moment | null) => boolean;

/**
 * DateField is an abstract base class to help implement
 * all the filter instructions that act on a single type of date
 * value, such as the done date.
 */
export abstract class DateField extends Field {
    protected readonly filterInstructions: FilterInstructions;

    constructor(filterInstructions: FilterInstructions | null = null) {
        super();
        if (filterInstructions !== null) {
            this.filterInstructions = filterInstructions;
        } else {
            this.filterInstructions = new FilterInstructions();
            this.filterInstructions.add(`has ${this.fieldName()} date`, (task: Task) => this.date(task) !== null);
            this.filterInstructions.add(`no ${this.fieldName()} date`, (task: Task) => this.date(task) === null);
            this.filterInstructions.add(`${this.fieldName()} date is invalid`, (task: Task) => {
                const date = this.date(task);
                return date !== null && !date.isValid();
            });
        }
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
            const keywordAndDateString = fieldNameKeywordDate[1]; // Will contain the whole line except the field name
            const fieldKeyword = fieldNameKeywordDate[2]; // Will be 'before', 'after', 'in', 'on' or undefined
            const fieldDateString = fieldNameKeywordDate[3]; // Will contain the remainder of the instruction

            // Try interpreting everything after the keyword as a date range:
            let fieldDates = DateParser.parseDateRange(fieldDateString);

            // If the date range parsing failed, try again to parse the whole line except the field name
            // as a single date, using the pre-date-ranges parsing mechanism.
            // This is needed to keep 'due in two weeks' working, as 'two weeks' is not actually a valid date range
            // if the futureDates value passed in to chrono's parsing functions is false.
            if (!fieldDates.isValid()) {
                const date = DateParser.parseDate(keywordAndDateString);
                if (date.isValid()) {
                    fieldDates = new DateRange(date, date);
                }
            }

            if (!fieldDates.isValid()) {
                result.error = 'do not understand ' + this.fieldName() + ' date';
            } else {
                const filterFunction = this.buildFilterFunction(fieldKeyword, fieldDates);

                const explanation = DateField.buildExplanation(
                    this.fieldNameForExplanation(),
                    fieldKeyword,
                    this.filterResultIfFieldMissing(),
                    fieldDates,
                );
                result.filter = new Filter(line, filterFunction, explanation);
            }
        } else {
            result.error = 'do not understand query filter (' + this.fieldName() + ' date)';
        }
        return result;
    }

    /**
     * Builds function that actually filters the tasks depending on the date
     * @param fieldKeyword relationship to be held with the date 'before', 'after'
     * @param fieldDates the date range to be used by the filter function
     * @returns the function that filters the tasks
     */
    protected buildFilterFunction(fieldKeyword: string, fieldDates: DateRange): FilterFunction {
        let dateFilter: DateFilterFunction;
        if (fieldKeyword === 'before') {
            dateFilter = (date) => (date ? date.isBefore(fieldDates.start) : this.filterResultIfFieldMissing());
        } else if (fieldKeyword === 'after') {
            dateFilter = (date) => (date ? date.isAfter(fieldDates.end) : this.filterResultIfFieldMissing());
        } else {
            dateFilter = (date) =>
                date
                    ? date.isSameOrAfter(fieldDates.start) && date.isSameOrBefore(fieldDates.end)
                    : this.filterResultIfFieldMissing();
        }
        return this.getFilter(dateFilter);
    }

    protected getFilter(dateFilterFunction: DateFilterFunction): FilterFunction {
        return (task: Task) => {
            return dateFilterFunction(this.date(task));
        };
    }

    protected filterRegExp(): RegExp {
        return new RegExp(`^${this.fieldNameForFilterInstruction()} ((before|after|on|in)? ?(.*))`);
    }

    /**
     * Enable support for 'starts ...' as filter where the field name is different ('start').
     */
    protected fieldNameForFilterInstruction(): string {
        return this.fieldName();
    }

    /**
     * Return the task's value for this date field, if any.
     * @param task - a Task object
     * @public
     */
    public abstract date(task: Task): Moment | null;

    /**
     * Constructs an Explanation for a date-based filter
     * @param fieldName - for example, 'due'
     * @param fieldKeyword - one of the keywords like 'before' or 'after'
     * @param filterResultIfFieldMissing - whether the search matches tasks without the requested date value
     * @param filterDates - the date range used in the filter
     */
    public static buildExplanation(
        fieldName: string,
        fieldKeyword: string,
        filterResultIfFieldMissing: boolean,
        filterDates: DateRange,
    ): Explanation {
        let relationship;
        // Example of formatted date: '2024-01-02 (Tuesday 2nd January 2024)'
        const dateFormat = 'YYYY-MM-DD (dddd Do MMMM YYYY)';
        let explanationDates;
        switch (fieldKeyword) {
            case 'before':
                relationship = fieldKeyword;
                explanationDates = filterDates.start.format(dateFormat);
                break;
            case 'after':
                relationship = fieldKeyword;
                explanationDates = filterDates.end.format(dateFormat);
                break;
            default:
                if (filterDates.start.isSame(filterDates.end)) {
                    relationship = 'on';
                    explanationDates = filterDates.start.format(dateFormat);
                } else {
                    // This is a special case where a multi-line explanation has to be built
                    // All other cases need only one line
                    const firstLine = `${fieldName} date is between:`;

                    // Consecutive lines
                    const subExplanations = [
                        new Explanation(`${filterDates.start.format(dateFormat)} and`),
                        new Explanation(`${filterDates.end.format(dateFormat)} inclusive`),
                    ];

                    // Optional line for StartDateField (so far)
                    if (filterResultIfFieldMissing) {
                        subExplanations.push(new Explanation(`OR no ${fieldName} date`));
                    }

                    return new Explanation(firstLine, subExplanations);
                }
                break;
        }

        let oneLineExplanation = `${fieldName} date is ${relationship} ${explanationDates}`;
        if (filterResultIfFieldMissing) {
            oneLineExplanation += ` OR no ${fieldName} date`;
        }
        return new Explanation(oneLineExplanation);
    }

    protected fieldNameForExplanation() {
        return this.fieldName();
    }

    /**
     * Determine whether a task that does not have the particular date value
     * should be treated as a match. For example, 'starts' searches match all tasks
     * that have no start date, which behaves differently from 'due', 'done' and
     * 'scheduled' searches.
     * @protected
     */
    protected abstract filterResultIfFieldMissing(): boolean;

    public supportsSorting(): boolean {
        return true;
    }

    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return compareByDate(this.date(a), this.date(b));
        };
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            const date = this.date(task);
            if (date === null) {
                return ['No ' + this.fieldName() + ' date'];
            }
            return [date.format('YYYY-MM-DD dddd')];
        };
    }
}
