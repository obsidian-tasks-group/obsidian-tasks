import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateParser } from '../DateParser';
import { Explanation } from '../Explain/Explanation';
import type { Comparator } from '../Sorter';
import { compareByDate } from '../../lib/DateTools';
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

    // TODO add previous and next
    public static readonly currentPeriodRegexp = /^current (week|month|year)$/;

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
            const matchCurrentPeriod = match[2].match(DateField.currentPeriodRegexp);

            // Something is wrong if the date is wrong AND we are not in current w/m/y case
            if (!filterDate.isValid() && matchCurrentPeriod == null) {
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

                if (match[1] === 'in') {
                    if (matchCurrentPeriod === null) {
                        result.error = 'do not understand query filter (' + this.fieldName() + ' date)';
                    } else {
                        filterFunction = (task: Task) => {
                            const date = this.date(task);
                            return date
                                ? DateField.isDateInCurrentPeriod(date, matchCurrentPeriod[1])
                                : this.filterResultIfFieldMissing();
                        };

                        result.filter = new Filter(
                            line,
                            filterFunction,
                            new Explanation(
                                DateField.getExplanationString(
                                    this.fieldName(),
                                    '',
                                    this.filterResultIfFieldMissing(),
                                    DateField.currentPeriodBoundaryDates(matchCurrentPeriod[1]),
                                ),
                            ),
                        );

                        // Exit here to return the result for 'current period'
                        return result;
                    }
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
        filterDateOrDateRange: moment.Moment | [moment.Moment, moment.Moment],
    ) {
        // Example of formatted date: '2024-01-02 (Tuesday 2nd January 2024)'
        const outputDateFormat = 'YYYY-MM-DD (dddd Do MMMM YYYY)';
        let result = `${fieldName} date is${relationshipPrefixedWithSpace}`;

        if (window.moment.isMoment(filterDateOrDateRange)) {
            const actualDate = filterDateOrDateRange.format(outputDateFormat);
            result += ` ${actualDate}`;
        } else {
            result += ' between ';
            result += filterDateOrDateRange[0].format(outputDateFormat);
            result += ' and ';
            result += filterDateOrDateRange[1].format(outputDateFormat);
            result += ' inclusive';
        }

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

    public supportsSorting(): boolean {
        return true;
    }

    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return compareByDate(this.date(a), this.date(b));
        };
    }

    public static currentPeriodBoundaryDates(period: string): [moment.Moment, moment.Moment] {
        switch (period) {
            case 'week':
                // Use locale-independant ISO 8601 weeks
                return [window.moment().startOf('isoWeek'), window.moment().endOf('isoWeek')];
            case 'month':
            case 'year':
                return [window.moment().startOf(period), window.moment().endOf(period)];
        }

        // error case here?
        return [window.moment(), window.moment()];
    }
    public static isDateInCurrentPeriod(date: moment.Moment, period: string): boolean {
        const currentPeriod = DateField.currentPeriodBoundaryDates(period);

        return date.isSameOrAfter(currentPeriod[0]) && date.isSameOrBefore(currentPeriod[1]);
    }
}
