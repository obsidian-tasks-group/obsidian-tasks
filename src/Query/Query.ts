import { LayoutOptions } from '../TaskLayout';
import type { Task } from '../Task';
import type { IQuery } from '../IQuery';
import { getSettings } from '../Config/Settings';
import { GlobalFilter } from '../Config/GlobalFilter';
import { Sort } from './Sort';
import type { Sorter } from './Sorter';
import type { TaskGroups } from './TaskGroups';
import * as FilterParser from './FilterParser';
import { Group } from './Group';
import type { Grouper } from './Grouper';
import type { GroupingProperty } from './Grouper';
import type { Filter } from './Filter/Filter';

export class Query implements IQuery {
    public source: string;

    private _limit: number | undefined = undefined;
    private _layoutOptions: LayoutOptions = new LayoutOptions();
    private _filters: Filter[] = [];
    private _error: string | undefined = undefined;
    private _sorting: Sorter[] = [];
    private _grouping: Grouper[] = [];

    private readonly groupByRegexp =
        /^group by (backlink|created|done|due|filename|folder|happens|heading|path|priority|recurrence|recurring|root|scheduled|start|status|tags)/;

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
                    case this.parseGroupBy2({ line }):
                        break;
                    case this.groupByRegexp.test(line):
                        this.parseGroupBy({ line });
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

    public explainQuery(): string {
        return 'Explanation of this Tasks code block query:\n\n' + this.explainQueryWithoutIntroduction();
    }

    public explainQueryWithoutIntroduction(): string {
        let result = '';

        if (!GlobalFilter.isEmpty()) {
            result += `Only tasks containing the global filter '${GlobalFilter.get()}'.\n\n`;
        }

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

    public get grouping() {
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
        return Group.by(this.grouping, tasksSortedLimited);
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
     * Old-style parsing of `group by` lines, for grouping that is implemented with static
     * methods in {@link Group}, that are looked up from a {@link GroupingProperty}.
     *
     * These will be gradually migrated to the grouping method in {@link Field}
     * classes, after which this method will be deleted.
     *
     * @param line
     * @private
     * @see parseGroupBy2
     */
    private parseGroupBy({ line }: { line: string }): void {
        const fieldMatch = line.match(this.groupByRegexp);
        if (fieldMatch !== null) {
            this._grouping.push(Group.fromGroupingProperty(fieldMatch[1] as GroupingProperty));
        } else {
            this._error = 'do not understand query grouping';
        }
    }

    /**
     * New-style parsing of `group by` lines, for grouping that is implemented in the {@link Field}
     * classes.
     *
     * Once the original {@link parseGroupBy} has been removed, rename this to parseGroupBy()
     * @param line
     * @private
     * @see parseGroupBy
     */
    private parseGroupBy2({ line }: { line: string }): boolean {
        const groupingMaybe = FilterParser.parseGrouper(line);
        if (groupingMaybe) {
            this._grouping.push(groupingMaybe);
            return true;
        }
        return false;
    }
}
