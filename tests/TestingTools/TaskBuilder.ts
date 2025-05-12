// Builder
import type { Moment } from 'moment';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Status } from '../../src/Statuses/Status';
import { OnCompletion } from '../../src/Task/OnCompletion';
import { Occurrence } from '../../src/Task/Occurrence';
import { Task } from '../../src/Task/Task';
import { Recurrence } from '../../src/Task/Recurrence';
import { DateParser } from '../../src/DateTime/DateParser';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import { TaskLocation } from '../../src/Task/TaskLocation';
import { Priority } from '../../src/Task/Priority';
import { setCurrentCacheFile } from '../__mocks__/obsidian';
import type { ListItem } from '../../src/Task/ListItem';
import type { SimulatedFile } from '../Obsidian/SimulatedFile';

/**
 * A fluent class for creating tasks for tests.
 *
 * This uses the Builder Pattern.
 *
 * See TaskBuilder.build() for an example of use.
 *
 * IMPORTANT: Changed values are retained after calls to .build()
 *            There is no way to reset a TaskBuilder to its default
 *            start currently.
 *            Create a new TaskBuilder object to start from a clean state,
 */
export class TaskBuilder {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    private _parent: ListItem | null = null;

    private _status: Status = Status.TODO;
    private _description: string = 'my description';
    private _path: string = '';
    private _indentation: string = '';
    private _listMarker: string = '-';

    private _lineNumber: number = 0;
    private _sectionStart: number = 0;
    private _sectionIndex: number = 0;

    private _precedingHeader: string | null = null;
    private _tags: string[] = [];
    private _priority: Priority = Priority.None;

    private _createdDate: Moment | null = null;
    private _startDate: Moment | null = null;
    private _scheduledDate: Moment | null = null;
    private _dueDate: Moment | null = null;
    private _doneDate: Moment | null = null;
    private _cancelledDate: Moment | null = null;

    private _recurrence: Recurrence | null = null;
    private _onCompletion: OnCompletion = OnCompletion.Ignore;
    private _blockLink: string = '';

    private _scheduledDateIsInferred: boolean = false;
    private _id: string = '';
    private _dependsOn: string[] = [];
    private _mockData?: SimulatedFile = undefined;

    /**
     * Build a Task
     *
     * Example of use:
     *
     *  const builder = new TaskBuilder();
     *  const task = builder
     *      .description('hello world')
     *      .priority(Priority.High)
     *      .path('root/dir 1/dir 2/file name')
     *      .build();
     */
    public build(): Task {
        let description = this._description;
        if (this._tags.length > 0) {
            description += ' ' + this._tags.join(' ');
        }
        if (this._mockData !== undefined) {
            setCurrentCacheFile(this._mockData);
        }
        const cachedMetadata = this._mockData?.cachedMetadata ?? {};
        const task = new Task({
            // NEW_TASK_FIELD_EDIT_REQUIRED
            parent: this._parent,
            status: this._status,
            description: description,
            taskLocation: new TaskLocation(
                new TasksFile(this._path, cachedMetadata),
                this._lineNumber,
                this._sectionStart,
                this._sectionIndex,
                this._precedingHeader,
            ),
            indentation: this._indentation,
            listMarker: this._listMarker,
            priority: this._priority,
            createdDate: this._createdDate,
            startDate: this._startDate,
            scheduledDate: this._scheduledDate,
            dueDate: this._dueDate,
            doneDate: this._doneDate,
            cancelledDate: this._cancelledDate,
            recurrence: this._recurrence,
            onCompletion: this._onCompletion,
            dependsOn: this._dependsOn,
            id: this._id,
            blockLink: this._blockLink,
            tags: this._tags,
            originalMarkdown: '',
            scheduledDateIsInferred: this._scheduledDateIsInferred,
        });
        const markdown = task.toFileLineString();
        return new Task({
            ...task,
            originalMarkdown: markdown,
        });
    }

    /**
     * Create a Task that has all fields populated.
     */
    public static createFullyPopulatedTask(): Task {
        const taskBuilder = new TaskBuilder()
            // NEW_TASK_FIELD_EDIT_REQUIRED
            .indentation('  ')
            .description('Do exercises')
            .tags(['#todo', '#health'])
            .priority(Priority.Medium)
            .createdDate('2023-07-01')
            .startDate('2023-07-02')
            .scheduledDate('2023-07-03')
            .dueDate('2023-07-04')
            .doneDate('2023-07-05')
            .cancelledDate('2023-07-06')
            .onCompletion(OnCompletion.Delete)
            .dependsOn(['123456', 'abc123'])
            .id('abcdef')
            .blockLink(' ^dcf64c')
            // Values in TaskLocation:
            .path('some/folder/fileName.md')
            .lineNumber(17)
            .sectionStart(5)
            .sectionIndex(3)
            .precedingHeader('My Header');

        taskBuilder.recurrence(
            Recurrence.fromText({
                recurrenceRuleText: 'every day when done',
                occurrence: new Occurrence({
                    startDate: taskBuilder._startDate,
                    scheduledDate: taskBuilder._scheduledDate,
                    dueDate: taskBuilder._dueDate,
                }),
            }),
        );

        const task = taskBuilder.build();

        // Force urgency value to be cached:
        // @ts-ignore
        const unused = task!.urgency;

        return task;
    }

    /**
     * Set the status.
     *
     * @param status
     */
    public status(status: Status): this {
        this._status = status;
        return this;
    }

    public statusValues(
        symbol: string,
        name: string,
        nextStatusSymbol: string,
        availableAsCommand: boolean,
        type: StatusType,
    ): this {
        const statusConfiguration = new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type);
        return this.status(new Status(statusConfiguration));
    }

    /**
     * Set the description.
     *
     * This is not parsed for tags. Tags should be added via the separate {@link tags} method.
     * @param description - description for the task, without tags
     */
    public description(description: string): this {
        this._description = description;
        return this;
    }

    /** Set the task's path on disc, including file name extension
     *
     * @param path Path to file, including file name extension. Use empty string to indicate 'unknown
     */
    public path(path: string): this {
        this._path = path;
        return this;
    }

    /**
     * See {@link example_kanban} and other files in the same directory, for available sample mock data.
     *
     * @example
     * import example_kanban from '../Obsidian/__test_data__/example_kanban.json';
     *      const builder = new TaskBuilder().mockData(example_kanban);
     * @param mockData
     */
    public mockData(mockData?: SimulatedFile) {
        this._mockData = mockData;
        return this;
    }

    public indentation(indentation: string): this {
        this._indentation = indentation;
        return this;
    }

    public listMarker(listMarker: string): this {
        this._listMarker = listMarker;
        return this;
    }

    public lineNumber(lineNumber: number): this {
        this._lineNumber = lineNumber;
        return this;
    }

    public sectionStart(sectionStart: number): this {
        this._sectionStart = sectionStart;
        return this;
    }

    public sectionIndex(sectionIndex: number): this {
        this._sectionIndex = sectionIndex;
        return this;
    }

    public precedingHeader(precedingHeader: string | null): this {
        this._precedingHeader = precedingHeader;
        return this;
    }

    public tags(tags: string[]): this {
        this._tags = tags;
        return this;
    }

    public priority(priority: Priority): this {
        this._priority = priority;
        return this;
    }

    public createdDate(createdDate: string | null): this {
        this._createdDate = TaskBuilder.parseDate(createdDate);
        return this;
    }

    public startDate(startDate: string | null): this {
        this._startDate = TaskBuilder.parseDate(startDate);
        return this;
    }

    public scheduledDate(scheduledDate: string | null): this {
        this._scheduledDate = TaskBuilder.parseDate(scheduledDate);
        return this;
    }

    public dueDate(dueDate: string | null): this {
        this._dueDate = TaskBuilder.parseDate(dueDate);
        return this;
    }

    public doneDate(doneDate: string | null): this {
        this._doneDate = TaskBuilder.parseDate(doneDate);
        return this;
    }

    public cancelledDate(cancelledDate: string | null): this {
        this._cancelledDate = TaskBuilder.parseDate(cancelledDate);
        return this;
    }

    /**
     * See {@link RecurrenceBuilder} for easy construction of {@link Recurrence} objects in tests.
     * @param recurrence
     */
    public recurrence(recurrence: Recurrence | null): this {
        this._recurrence = recurrence;
        return this;
    }

    public onCompletion(onCompletion: OnCompletion): this {
        this._onCompletion = onCompletion;
        return this;
    }

    public blockLink(blockLink: string): this {
        this._blockLink = blockLink;
        return this;
    }

    public scheduledDateIsInferred(isInferred: boolean) {
        this._scheduledDateIsInferred = isInferred;
        return this;
    }

    public dependsOn(dependsOn: string[]) {
        this._dependsOn = dependsOn;
        return this;
    }

    public id(id: string) {
        this._id = id;
        return this;
    }

    private static parseDate(date: string | null): Moment | null {
        if (date) {
            return DateParser.parseDate(date);
        } else {
            return null;
        }
    }

    public parent(parent: ListItem | null) {
        this._parent = parent;
        return this;
    }
}
