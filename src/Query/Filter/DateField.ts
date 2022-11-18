import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateParser } from '../DateParser';
import { Explanation } from '../Explain/Explanation';
import { Field } from './Field';
import { Filter, FilterOrErrorMessage } from './Filter';
import { FilterInstructions } from './FilterInstructions';

/**
 * DateField is an abstract base class to help implement
 * all the filter instructions that act on a single type of date
 * value, such as the done date.
 */
export abstract class DateField extends Field {
    private readonly filterInstructions: FilterInstructions;

    constructor() {
        super();
        this.filterInstructions = new FilterInstructions();
        this.filterInstructions.add(`has ${this.fieldName()} date`, (task: Task) => this.date(task) !== null);
        this.filterInstructions.add(`no ${this.fieldName()} date`, (task: Task) => this.date(task) === null);
        this.filterInstructions.add(`${this.fieldName()} date is invalid`, (task: Task) => {
            const date = this.date(task);
            return date !== null && !date.isValid();
        });
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

        const match = Field.getMatch(this.filterRegExp(), line);
        let filterFunction;
        if (match !== null) {
            const filterDate = DateParser.parseDate(match[2]);
            if (!filterDate.isValid()) {
                result.error = 'do not understand ' + this.fieldName() + ' date';
            } else {
                let relative;
                if (match[1] === 'before') {
                    filterFunction = (task: Task) => {
                        const date = this.date(task);
                        return date ? date.isBefore(filterDate) : this.filterResultIfFieldMissing();
                    };
                    relative = ' ' + match[1];
                } else if (match[1] === 'after') {
                    filterFunction = (task: Task) => {
                        const date = this.date(task);
                        return date ? date.isAfter(filterDate) : this.filterResultIfFieldMissing();
                    };
                    relative = ' ' + match[1];
                } else {
                    filterFunction = (task: Task) => {
                        const date = this.date(task);
                        return date ? date.isSame(filterDate) : this.filterResultIfFieldMissing();
                    };
                    relative = ' on';
                }
                const explanation = DateField.getExplanationString(
                    this.fieldName(),
                    relative,
                    this.filterResultIfFieldMissing(),
                    filterDate,
                );
                result.filter = new Filter(line, filterFunction, new Explanation(explanation));
            }
        } else {
            result.error = 'do not understand query filter (' + this.fieldName() + ' date)';
        }
        return result;
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
     * @param relationshipPrefixedWithSpace - for example ' before' or ''
     * @param filterResultIfFieldMissing - whether the search matches tasks without the requested date value
     * @param filterDate - the date used in the filter
     */
    public static getExplanationString(
        fieldName: string,
        relationshipPrefixedWithSpace: string,
        filterResultIfFieldMissing: boolean,
        filterDate: moment.Moment,
    ) {
        // Example of formatted date: '2024-01-02 (Tuesday 2nd January 2024)'
        const actualDate = filterDate.format('YYYY-MM-DD (dddd Do MMMM YYYY)');
        let result = `${fieldName} date is${relationshipPrefixedWithSpace} ${actualDate}`;
        if (filterResultIfFieldMissing) {
            result += ` OR no ${fieldName} date`;
        }
        return result;
    }

    /**
     * Determine whether a task that does not have the particular date value
     * should be treated as a match. For example, 'starts' searches match all tasks
     * that have no start date, which behaves differently from 'due', 'done' and
     * 'scheduled' searches.
     * @protected
     */
    protected abstract filterResultIfFieldMissing(): boolean;
}
