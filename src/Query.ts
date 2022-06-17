import { Group } from './Query/Group';
import type { TaskGroups } from './Query/TaskGroups';

import { LayoutOptions } from './LayoutOptions';
import { Sort } from './Sort';
import type { Task } from './Task';
import type { IQuery } from './IQuery';

import type { Field } from './Query/Filter/Field';
import { DescriptionField } from './Query/Filter/DescriptionField';
import { DoneDateField } from './Query/Filter/DoneDateField';
import { DueDateField } from './Query/Filter/DueDateField';
import { HeadingField } from './Query/Filter/HeadingField';
import { PathField } from './Query/Filter/PathField';
import { PriorityField } from './Query/Filter/PriorityField';
import { ScheduledDateField } from './Query/Filter/ScheduledDateField';
import { StartDateField } from './Query/Filter/StartDateField';
import { HappensDateField } from './Query/Filter/HappensDateField';
import { StatusField } from './Query/Filter/StatusField';
import { TagsField } from './Query/Filter/TagsField';

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
    | 'heading'
    | 'path'
    | 'scheduled'
    | 'start'
    | 'status';
export type Grouping = { property: GroupingProperty };

export class Query implements IQuery {
    public source: string;

    private _limit: number | undefined = undefined;
    private _layoutOptions: LayoutOptions = new LayoutOptions();
    private _filters: ((task: Task) => boolean)[] = [];
    private _error: string | undefined = undefined;
    private _sorting: Sorting[] = [];
    private _grouping: Grouping[] = [];

    // If a tag is specified the user can also add a number to specify
    // which one to sort by if there is more than one.
    private readonly sortByRegexp =
        /^sort by (urgency|status|priority|start|scheduled|due|done|path|description|tag)( reverse)?[\s]*(\d+)?/;

    private readonly groupByRegexp =
        /^group by (backlink|done|due|filename|folder|heading|path|scheduled|start|status)/;

    private readonly hideOptionsRegexp =
        /^hide (task count|backlink|priority|start date|scheduled date|done date|due date|recurrence rule|edit button)/;
    private readonly shortModeRegexp = /^short/;

    private readonly recurringString = 'is recurring';
    private readonly notRecurringString = 'is not recurring';

    private readonly limitRegexp = /^limit (to )?(\d+)( tasks?)?/;
    private readonly excludeSubItemsString = 'exclude sub-items';

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
                    case line === this.recurringString:
                        this._filters.push((task) => task.recurrence !== null);
                        break;
                    case line === this.notRecurringString:
                        this._filters.push((task) => task.recurrence === null);
                        break;
                    case line === this.excludeSubItemsString:
                        this._filters.push((task) => task.indentation === '');
                        break;
                    case this.shortModeRegexp.test(line):
                        this._layoutOptions.shortMode = true;
                        break;
                    case this.parseFilter(line, new StatusField()):
                        break;
                    case this.parseFilter(line, new PriorityField()):
                        break;
                    case this.parseFilter(line, new HappensDateField()):
                        break;
                    case this.parseFilter(line, new StartDateField()):
                        break;
                    case this.parseFilter(line, new ScheduledDateField()):
                        break;
                    case this.parseFilter(line, new DueDateField()):
                        break;
                    case this.parseFilter(line, new DoneDateField()):
                        break;
                    case this.parseFilter(line, new PathField()):
                        break;
                    case this.parseFilter(line, new DescriptionField()):
                        break;
                    case this.parseFilter(line, new TagsField()):
                        break;
                    case this.parseFilter(line, new HeadingField()):
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

    public get filters(): ((task: Task) => boolean)[] {
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
            tasks = tasks.filter(filter);
        });

        const tasksSortedLimited = Sort.by(this, tasks).slice(0, this.limit);
        return Group.by(this.grouping, tasksSortedLimited);
    }

    private parseHideOptions({ line }: { line: string }): void {
        const hideOptionsMatch = line.match(this.hideOptionsRegexp);
        if (hideOptionsMatch !== null) {
            const option = hideOptionsMatch[1].trim().toLowerCase();

            switch (option) {
                case 'task count':
                    this._layoutOptions.hideTaskCount = true;
                    break;
                case 'backlink':
                    this._layoutOptions.hideBacklinks = true;
                    break;
                case 'priority':
                    this._layoutOptions.hidePriority = true;
                    break;
                case 'start date':
                    this._layoutOptions.hideStartDate = true;
                    break;
                case 'scheduled date':
                    this._layoutOptions.hideScheduledDate = true;
                    break;
                case 'due date':
                    this._layoutOptions.hideDueDate = true;
                    break;
                case 'done date':
                    this._layoutOptions.hideDoneDate = true;
                    break;
                case 'recurrence rule':
                    this._layoutOptions.hideRecurrenceRule = true;
                    break;
                case 'edit button':
                    this._layoutOptions.hideEditButton = true;
                    break;
                default:
                    this._error = 'do not understand hide option';
            }
        }
    }

    private parseFilter(line: string, field: Field) {
        if (field.canCreateFilterForLine(line)) {
            const { filter, error } = field.createFilterOrErrorMessage(line);

            if (filter) {
                this._filters.push(filter);
            } else {
                this._error = error;
            }
            return true;
        } else {
            return false;
        }
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
