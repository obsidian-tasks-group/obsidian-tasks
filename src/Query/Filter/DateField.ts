import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateParser } from '../DateParser';
import { Explanation } from '../Explain/Explanation';
import type { Comparator } from '../Sorter';
import { compareByDate } from '../../lib/DateTools';
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
            const fieldKeyword = fieldNameKeywordDate[1];
            const fieldDate = DateParser.parseDate(fieldNameKeywordDate[2]);
            if (!fieldDate.isValid()) {
                result.error = 'do not understand ' + this.fieldName() + ' date';
            } else {
                const filterFunction = this.buildFilterFunction(fieldKeyword, fieldDate);

                const explanation = DateField.buildExplanation(
                    this.fieldNameForExplanation(),
                    fieldKeyword,
                    this.filterResultIfFieldMissing(),
                    fieldDate,
                );
                result.filter = new Filter(line, filterFunction, new Explanation(explanation));
            }
        } else {
            result.error = 'do not understand query filter (' + this.fieldName() + ' date)';
        }
        return result;
    }

    /**
     * Builds function that actually filters the tasks depending on the date
     * @param fieldKeyword relationship to be held with the date 'before', 'after'
     * @param fieldDate the date to be used by the filter function
     * @returns the function that filters the tasks
     */
    protected buildFilterFunction(fieldKeyword: string, fieldDate: moment.Moment): FilterFunction {
        let dateFilter: DateFilterFunction;
        if (fieldKeyword === 'before') {
            dateFilter = (date) => (date ? date.isBefore(fieldDate) : this.filterResultIfFieldMissing());
        } else if (fieldKeyword === 'after') {
            dateFilter = (date) => (date ? date.isAfter(fieldDate) : this.filterResultIfFieldMissing());
        } else {
            dateFilter = (date) => (date ? date.isSame(fieldDate) : this.filterResultIfFieldMissing());
        }
        return this.getFilter(dateFilter);
    }

    protected getFilter(dateFilterFunction: DateFilterFunction): FilterFunction {
        return (task: Task) => {
            return dateFilterFunction(this.date(task));
        };
    }

    protected filterRegExp(): RegExp {
        return new RegExp(`^${this.fieldNameForFilterInstruction()} (before|after|on)? ?(.*)`);
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
     * Construct a string used to explain a date-based filter
     * @param fieldName - for example, 'due'
     * @param fieldKeyword - one of the keywords like 'before' or 'after'
     * @param filterResultIfFieldMissing - whether the search matches tasks without the requested date value
     * @param filterDate - the date used in the filter
     */
    public static buildExplanation(
        fieldName: string,
        fieldKeyword: string,
        filterResultIfFieldMissing: boolean,
        filterDate: moment.Moment,
    ): string {
        let relationship;
        switch (fieldKeyword) {
            case 'before':
            case 'after':
                relationship = fieldKeyword;
                break;
            default:
                relationship = 'on';
                break;
        }
        // Example of formatted date: '2024-01-02 (Tuesday 2nd January 2024)'
        const actualDate = filterDate.format('YYYY-MM-DD (dddd Do MMMM YYYY)');
        let result = `${fieldName} date is ${relationship} ${actualDate}`;
        if (filterResultIfFieldMissing) {
            result += ` OR no ${fieldName} date`;
        }
        return result;
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
}
