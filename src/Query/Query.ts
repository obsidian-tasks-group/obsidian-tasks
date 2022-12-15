import { LayoutOptions } from '../LayoutOptions';
import type { Task } from '../Task';
import type { IQuery } from '../IQuery';
import { getSettings } from '../Config/Settings';
import { Sort, Sorting } from './Sort';
import type { TaskGroups } from './TaskGroups';
import { parseFilter } from './FilterParser';
import { Group } from './Group';
import type { Filter } from './Filter/Filter';
import { StatusField } from './Filter/StatusField';

// TODO Work through the values in SortingProperty, moving their comparison
//      functions to the corresponding Field implementations.
//      Then remove SortingProperty.
export type SortingProperty =
    | 'urgency'
    | 'priority'
    | 'start'
    | 'scheduled'
    | 'due'
    | 'done'
    | 'path'
    | 'description'
    | 'tag';

export type GroupingProperty =
    | 'backlink'
    | 'done'
    | 'due'
    | 'filename'
    | 'folder'
    | 'happens'
    | 'heading'
    | 'path'
    | 'priority'
    | 'recurrence'
    | 'recurring'
    | 'root'
    | 'scheduled'
    | 'start'
    | 'status'
    | 'tags';
export type Grouping = { property: GroupingProperty };

export class Query implements IQuery {
    public source: string;

    private _limit: number | undefined = undefined;
    private _layoutOptions: LayoutOptions = new LayoutOptions();
    private _filters: Filter[] = [];
    private _error: string | undefined = undefined;
    private _sorting: Sorting[] = [];
    private _grouping: Grouping[] = [];

    // If a tag is specified the user can also add a number to specify
    // which one to sort by if there is more than one.
    private readonly sortByRegexp =
        /^sort by (urgency|status|priority|start|scheduled|due|done|path|description|tag)( reverse)?[\s]*(\d+)?/;

    private readonly groupByRegexp =
        /^group by (backlink|done|due|filename|folder|happens|heading|path|priority|recurrence|recurring|root|scheduled|start|status|tags)/;

    private readonly hideOptionsRegexp =
        /^(hide|show) (task count|backlink|priority|start date|scheduled date|done date|due date|recurrence rule|edit button|urgency)/;
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
                    case this.sortByRegexp.test(line):
                        this.parseSortBy({ line });
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

        const { globalFilter } = getSettings();
        if (globalFilter.length !== 0) {
            result += `Only tasks containing the global filter '${globalFilter}'.\n\n`;
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

        const tasksSortedLimited = Sort.by(this, tasks).slice(0, this.limit);
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
        const filterOrError = parseFilter(line);
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

    private parseSortBy({ line }: { line: string }): void {
        // New style parsing, which is done by the Field classes.
        // Initially this is only implemented for status.
        // TODO Once a few more Field classes have comparator implementations,
        //      convert this to look like Query.parseFilter(),
        //      which will call a new function in FilterParser - parseSorter() or parseSortBy()
        const statusSorter = new StatusField().createSorter(line);
        if (statusSorter) {
            this._sorting.push(statusSorter);
            return;
        }

        // Old-style parsing, based on all the values in SortingProperty above.
        // TODO Migrate all the compare functions in Sort over to the
        //      corresponding fields, so that the block below can be removed.
        const fieldMatch = line.match(this.sortByRegexp);
        if (fieldMatch !== null) {
            this._sorting.push(
                new Sorting(
                    !!fieldMatch[2],
                    isNaN(+fieldMatch[3]) ? 1 : +fieldMatch[3],
                    fieldMatch[1] as SortingProperty,
                ),
            );
        } else {
            this._error = 'do not understand query sorting';
        }
    }

    private parseGroupBy({ line }: { line: string }): void {
        const fieldMatch = line.match(this.groupByRegexp);
        if (fieldMatch !== null) {
            this._grouping.push({
                property: fieldMatch[1] as GroupingProperty,
            });
        } else {
            this._error = 'do not understand query grouping';
        }
    }
}
