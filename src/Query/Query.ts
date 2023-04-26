import { LayoutOptions } from '../TaskLayout';
import type { Task } from '../Task';
import type { IQuery } from '../IQuery';
import { getSettings } from '../Config/Settings';
import { Sort } from './Sort';
import type { Sorter } from './Sorter';
import { TaskGroups } from './TaskGroups';
import * as FilterParser from './FilterParser';
import type { Grouper } from './Grouper';
import type { Filter } from './Filter/Filter';

export class Query implements IQuery {
    public source: string;

    private _limit: number | undefined = undefined;
    private _layoutOptions: LayoutOptions = new LayoutOptions();
    private _filters: Filter[] = [];
    private _error: string | undefined = undefined;
    private _sorting: Sorter[] = [];
    private _grouping: Grouper[] = [];

    private readonly hideOptionsRegexp =
        /^(hide|show) (task count|backlink|priority|created date|start date|scheduled date|done date|due date|recurrence rule|edit button|urgency)/;
    private readonly shortModeRegexp = /^short/;
    private readonly explainQueryRegexp = /^explain/;

    private readonly limitRegexp = /^limit (to )?(\d+)( tasks?)?/;

    private readonly commentRegexp = /^#.*/;

    constructor({ source }: { source: string }) {
        this.source = source;
        source
            .split('\n')
            .map((line: string) => line.trim())
            .forEach((line: string) => {
                switch (true) {
                    case line === '':
                        break;
                    case this.shortModeRegexp.test(line):
                        this._layoutOptions.shortMode = true;
                        break;
                    case this.explainQueryRegexp.test(line):
                        this._layoutOptions.explainQuery = true;
                        break;
                    case this.limitRegexp.test(line):
                        this.parseLimit({ line });
                        break;
                    case this.parseSortBy({ line }):
                        break;
                    case this.parseGroupBy({ line }):
                        break;
                    case this.hideOptionsRegexp.test(line):
                        this.parseHideOptions({ line });
                        break;
                    case this.commentRegexp.test(line):
                        // Comment lines are ignored
                        break;
                    case this.parseFilter(line):
                        break;
                    default:
                        this._error = `do not understand query: ${line}`;
                }
            });
    }

    /**
     *
     * Appends {@link q2} to this query.
     *
     * @note At time of writing, this query language appears to play nicely with combining queries.
     *
     * More formally, the concatenation operation on the query language:
     *     * Is closed (concatenating two queries is another valid query)
     *     * Is not commutative (q1.append(q2) !== q2.append(q1))
     *
     * And the semantics of the combination are straight forward:
     *     * Combining two queries appends their filters
     *           (assuming that the filters are pure functions, filter concatenation is commutative)
     *     * Combining two queries appends their sorting instructions. (this is not commutative)
     *     * Combining two queries appends their grouping instructions. (this is not commutative)
     *     * Successive limit instructions overwrite previous ones.
     *
     * @param {Query} q2
     * @return {Query} The combined query
     */
    public append(q2: Query): Query {
        if (this.source === '') return q2;
        if (q2.source === '') return this;
        return new Query({ source: `${this.source}\n${q2.source}` });
    }

    /**
     * Generate a text description of the contents of this query.
     *
     * This does not show any global filter and global query.
     * Use {@link explainResults} if you want to see any global query and global filter as well.
     */
    public explainQuery(): string {
        let result = '';

        const numberOfFilters = this.filters.length;
        if (numberOfFilters === 0) {
            result += 'No filters supplied. All tasks will match the query.';
        } else {
            for (let i = 0; i < numberOfFilters; i++) {
                if (i > 0) result += '\n';
                result += this.filters[i].explainFilterIndented('');
            }
        }

        if (this._limit !== undefined) {
            result += `\n\nAt most ${this._limit} task`;
            if (this._limit !== 1) {
                result += 's';
            }
            result += '.\n';
        }

        const { debugSettings } = getSettings();
        if (debugSettings.ignoreSortInstructions) {
            result +=
                "\n\nNOTE: All sort instructions, including default sort order, are disabled, due to 'ignoreSortInstructions' setting.";
        }

        return result;
    }

    public get limit(): number | undefined {
        return this._limit;
    }

    public get layoutOptions(): LayoutOptions {
        return this._layoutOptions;
    }

    public get filters(): Filter[] {
        return this._filters;
    }

    public get sorting() {
        return this._sorting;
    }

    /**
     * Return the {@link Grouper} objects that represent any `group by` instructions in the tasks block.
     */
    public get grouping(): Grouper[] {
        return this._grouping;
    }

    public get error(): string | undefined {
        return this._error;
    }

    public applyQueryToTasks(tasks: Task[]): TaskGroups {
        this.filters.forEach((filter) => {
            tasks = tasks.filter(filter.filterFunction);
        });

        const { debugSettings } = getSettings();
        const tasksSorted = debugSettings.ignoreSortInstructions ? tasks : Sort.by(this.sorting, tasks);
        const tasksSortedLimited = tasksSorted.slice(0, this.limit);
        return new TaskGroups(this.grouping, tasksSortedLimited);
    }

    private parseHideOptions({ line }: { line: string }): void {
        const hideOptionsMatch = line.match(this.hideOptionsRegexp);
        if (hideOptionsMatch !== null) {
            const hide = hideOptionsMatch[1] === 'hide';
            const option = hideOptionsMatch[2];

            switch (option) {
                case 'task count':
                    this._layoutOptions.hideTaskCount = hide;
                    break;
                case 'backlink':
                    this._layoutOptions.hideBacklinks = hide;
                    break;
                case 'priority':
                    this._layoutOptions.hidePriority = hide;
                    break;
                case 'created date':
                    this._layoutOptions.hideCreatedDate = hide;
                    break;
                case 'start date':
                    this._layoutOptions.hideStartDate = hide;
                    break;
                case 'scheduled date':
                    this._layoutOptions.hideScheduledDate = hide;
                    break;
                case 'due date':
                    this._layoutOptions.hideDueDate = hide;
                    break;
                case 'done date':
                    this._layoutOptions.hideDoneDate = hide;
                    break;
                case 'recurrence rule':
                    this._layoutOptions.hideRecurrenceRule = hide;
                    break;
                case 'edit button':
                    this._layoutOptions.hideEditButton = hide;
                    break;
                case 'urgency':
                    this._layoutOptions.hideUrgency = hide;
                    break;
                default:
                    this._error = 'do not understand hide/show option';
            }
        }
    }

    private parseFilter(line: string) {
        const filterOrError = FilterParser.parseFilter(line);
        if (filterOrError != null) {
            if (filterOrError.filter) this._filters.push(filterOrError.filter);
            else this._error = filterOrError.error;
            return true;
        }
        return false;
    }

    private parseLimit({ line }: { line: string }): void {
        const limitMatch = line.match(this.limitRegexp);
        if (limitMatch !== null) {
            // limitMatch[2] is per regex always digits and therefore parsable.
            this._limit = Number.parseInt(limitMatch[2], 10);
        } else {
            this._error = 'do not understand query limit';
        }
    }

    private parseSortBy({ line }: { line: string }): boolean {
        const sortingMaybe = FilterParser.parseSorter(line);
        if (sortingMaybe) {
            this._sorting.push(sortingMaybe);
            return true;
        }
        return false;
    }

    /**
     * Parsing of `group by` lines, for grouping that is implemented in the {@link Field}
     * classes.
     *
     * @param line
     * @private
     */
    private parseGroupBy({ line }: { line: string }): boolean {
        const groupingMaybe = FilterParser.parseGrouper(line);
        if (groupingMaybe) {
            this._grouping.push(groupingMaybe);
            return true;
        }
        return false;
    }
}
