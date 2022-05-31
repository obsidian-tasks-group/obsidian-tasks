import { Group } from './Query/Group';
import type { TaskGroups } from './Query/TaskGroups';

import { LayoutOptions } from './LayoutOptions';
import { Sort } from './Sort';
import { Priority, Status, Task } from './Task';
import type { IQuery } from './IQuery';

import type { Field } from './Query/Filter/Field';
import { DescriptionField } from './Query/Filter/DescriptionField';
import { DoneDateField } from './Query/Filter/DoneDateField';
import { DueDateField } from './Query/Filter/DueDateField';
import { HeadingField } from './Query/Filter/HeadingField';
import { PathField } from './Query/Filter/PathField';
import { ScheduledDateField } from './Query/Filter/ScheduledDateField';
import { StartDateField } from './Query/Filter/StartDateField';
import { HappensDateField } from './Query/Filter/HappensDateField';

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
    | 'filename'
    | 'folder'
    | 'heading'
    | 'path'
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

    private readonly priorityRegexp =
        /^priority (is )?(above|below)? ?(low|none|medium|high)/;

    private readonly noStartString = 'no start date';
    private readonly hasStartString = 'has start date';

    private readonly noScheduledString = 'no scheduled date';
    private readonly hasScheduledString = 'has scheduled date';

    private readonly noDueString = 'no due date';
    private readonly hasDueString = 'has due date';

    private readonly doneString = 'done';
    private readonly notDoneString = 'not done';

    // Handles both ways of referencing the tags query.
    private readonly tagRegexp =
        /^(tag|tags) (includes|does not include|include|do not include) (.*)/;

    // If a tag is specified the user can also add a number to specify
    // which one to sort by if there is more than one.
    private readonly sortByRegexp =
        /^sort by (urgency|status|priority|start|scheduled|due|done|path|description|tag)( reverse)?[\s]*(\d+)?/;

    private readonly groupByRegexp =
        /^group by (backlink|filename|folder|heading|path|status)/;

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
                    case line === this.doneString:
                        this._filters.push(
                            (task) => task.status === Status.Done,
                        );
                        break;
                    case line === this.notDoneString:
                        this._filters.push(
                            (task) => task.status !== Status.Done,
                        );
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
                    case line === this.noStartString:
                        this._filters.push((task) => task.startDate === null);
                        break;
                    case line === this.noScheduledString:
                        this._filters.push(
                            (task) => task.scheduledDate === null,
                        );
                        break;
                    case line === this.noDueString:
                        this._filters.push((task) => task.dueDate === null);
                        break;
                    case line === this.hasStartString:
                        this._filters.push((task) => task.startDate !== null);
                        break;
                    case line === this.hasScheduledString:
                        this._filters.push(
                            (task) => task.scheduledDate !== null,
                        );
                        break;
                    case line === this.hasDueString:
                        this._filters.push((task) => task.dueDate !== null);
                        break;
                    case this.shortModeRegexp.test(line):
                        this._layoutOptions.shortMode = true;
                        break;
                    case this.priorityRegexp.test(line):
                        this.parsePriorityFilter({ line });
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
                    case this.tagRegexp.test(line):
                        this.parseTagFilter({ line });
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

    private parsePriorityFilter({ line }: { line: string }): void {
        const priorityMatch = line.match(this.priorityRegexp);
        if (priorityMatch !== null) {
            const filterPriorityString = priorityMatch[3];
            let filterPriority: Priority | null = null;

            switch (filterPriorityString) {
                case 'low':
                    filterPriority = Priority.Low;
                    break;
                case 'none':
                    filterPriority = Priority.None;
                    break;
                case 'medium':
                    filterPriority = Priority.Medium;
                    break;
                case 'high':
                    filterPriority = Priority.High;
                    break;
            }

            if (filterPriority === null) {
                this._error = 'do not understand priority';
                return;
            }

            let filter;
            if (priorityMatch[2] === 'above') {
                filter = (task: Task) =>
                    task.priority
                        ? task.priority.localeCompare(filterPriority!) < 0
                        : false;
            } else if (priorityMatch[2] === 'below') {
                filter = (task: Task) =>
                    task.priority
                        ? task.priority.localeCompare(filterPriority!) > 0
                        : false;
            } else {
                filter = (task: Task) =>
                    task.priority ? task.priority === filterPriority : false;
            }

            this._filters.push(filter);
        } else {
            this._error = 'do not understand query filter (priority date)';
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

    /**
     * When a tag based filter is used this is the process to apply it.
     * - Tags can be searched for with and without the hash tag at the start.
     *
     * @private
     * @param {{ line: string }} { line }
     * @memberof Query
     */
    private parseTagFilter({ line }: { line: string }): void {
        const tagMatch = line.match(this.tagRegexp);
        if (tagMatch !== null) {
            const filterMethod = tagMatch[2];

            // Search is done sans the hash. If it is provided then strip it off.
            const search = tagMatch[3].replace(/^#/, '');

            if (filterMethod === 'include' || filterMethod === 'includes') {
                this._filters.push(
                    (task: Task) =>
                        task.tags.find((tag) =>
                            tag.toLowerCase().includes(search.toLowerCase()),
                        ) !== undefined,
                );
            } else if (
                tagMatch[2] === 'do not include' ||
                tagMatch[2] === 'does not include'
            ) {
                this._filters.push(
                    (task: Task) =>
                        task.tags.find((tag) =>
                            tag.toLowerCase().includes(search.toLowerCase()),
                        ) == undefined,
                );
            } else {
                this._error = 'do not understand query filter (tag/tags)';
            }
        } else {
            this._error = 'do not understand query filter (tag/tags)';
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
