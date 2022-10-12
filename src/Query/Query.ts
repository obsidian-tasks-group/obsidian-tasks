import { LayoutOptions } from '../LayoutOptions';
import type { Task } from '../Task';
import type { IQuery } from '../IQuery';
import { Sort } from './Sort';
import type { TaskGroups } from './TaskGroups';
import { parseFilter } from './FilterParser';
import { Group } from './Group';
import type { Filter } from './Filter/Filter';

export type SortingProperty =
    | 'urgency'
    | 'status'
    | 'priority'
    | 'start'
    | 'scheduled'
    | 'due'
    | 'done'
    | 'path'
    | 'description'
    | 'tag';
type Sorting = {
    property: SortingProperty;
    reverse: boolean;
    propertyInstance: number;
};

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
        const fieldMatch = line.match(this.sortByRegexp);
        if (fieldMatch !== null) {
            this._sorting.push({
                property: fieldMatch[1] as SortingProperty,
                reverse: !!fieldMatch[2],
                propertyInstance: isNaN(+fieldMatch[3]) ? 1 : +fieldMatch[3],
            });
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
