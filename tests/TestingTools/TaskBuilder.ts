// Builder
import type { Moment } from 'moment';
import { Priority, Status, Task } from '../../src/Task';
import type { Recurrence } from '../../src/Recurrence';
import { DateParser } from '../../src/Query/DateParser';

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
    private _status: Status = Status.TODO;
    private _description: string = 'my description';
    private _path: string = '';
    private _indentation: string = '';

    private _sectionStart: number = 0;
    private _sectionIndex: number = 0;

    private _originalStatusCharacter: string = ' ';
    private _precedingHeader: string | null = null;
    private _tags: string[] = [];
    private _priority: Priority = Priority.None;

    private _startDate: Moment | null = null;
    private _scheduledDate: Moment | null = null;
    private _dueDate: Moment | null = null;
    private _doneDate: Moment | null = null;

    private _recurrence: Recurrence | null = null;
    private _blockLink: string = '';

    private _scheduledDateIsInferred: boolean = false;

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
        return new Task({
            status: this._status,
            description: description,
            path: this._path,
            indentation: this._indentation,
            sectionStart: this._sectionStart,
            sectionIndex: this._sectionIndex,
            originalStatusCharacter: this._originalStatusCharacter,
            precedingHeader: this._precedingHeader,
            priority: this._priority,
            startDate: this._startDate,
            scheduledDate: this._scheduledDate,
            dueDate: this._dueDate,
            doneDate: this._doneDate,
            recurrence: this._recurrence,
            blockLink: this._blockLink,
            tags: this._tags,
            originalMarkdown: '',
            scheduledDateIsInferred: this._scheduledDateIsInferred,
        });
    }

    public status(status: Status): TaskBuilder {
        this._status = status;
        return this;
    }

    /**
     * Set the description.
     *
     * This is not parsed for tags. Tags should be added via the separate {@link tags} method.
     * @param description - description for the task, without tags
     */
    public description(description: string): TaskBuilder {
        this._description = description;
        return this;
    }

    /** Set the task's path on disc, including file name extension
     *
     * @param path Path to file, including file name extension. Use empty string to indicate 'unknown
     */
    public path(path: string): TaskBuilder {
        this._path = path;
        return this;
    }

    public indentation(indentation: string): TaskBuilder {
        this._indentation = indentation;
        return this;
    }

    public sectionStart(sectionStart: number): TaskBuilder {
        this._sectionStart = sectionStart;
        return this;
    }

    public sectionIndex(sectionIndex: number): TaskBuilder {
        this._sectionIndex = sectionIndex;
        return this;
    }

    public originalStatusCharacter(originalStatusCharacter: string): TaskBuilder {
        this._originalStatusCharacter = originalStatusCharacter;
        return this;
    }

    public precedingHeader(precedingHeader: string | null): TaskBuilder {
        this._precedingHeader = precedingHeader;
        return this;
    }

    public tags(tags: string[]): TaskBuilder {
        this._tags = tags;
        return this;
    }

    public priority(priority: Priority): TaskBuilder {
        this._priority = priority;
        return this;
    }

    public startDate(startDate: string | null): TaskBuilder {
        this._startDate = TaskBuilder.parseDate(startDate);
        return this;
    }

    public scheduledDate(scheduledDate: string | null): TaskBuilder {
        this._scheduledDate = TaskBuilder.parseDate(scheduledDate);
        return this;
    }

    public dueDate(dueDate: string | null): TaskBuilder {
        this._dueDate = TaskBuilder.parseDate(dueDate);
        return this;
    }

    public doneDate(doneDate: string | null): TaskBuilder {
        this._doneDate = TaskBuilder.parseDate(doneDate);
        return this;
    }

    public recurrence(recurrence: Recurrence | null): TaskBuilder {
        this._recurrence = recurrence;
        return this;
    }

    public blockLink(blockLink: string): TaskBuilder {
        this._blockLink = blockLink;
        return this;
    }

    public scheduledDateIsInferred(isInferred: boolean) {
        this._scheduledDateIsInferred = isInferred;
        return this;
    }

    private static parseDate(date: string | null): Moment | null {
        if (date) {
            return DateParser.parseDate(date);
        } else {
            return null;
        }
    }
}
