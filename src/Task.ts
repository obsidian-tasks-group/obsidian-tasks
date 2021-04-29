import moment, { Moment } from 'moment';
import { Component, MarkdownRenderer } from 'obsidian';
import { RRule } from 'rrule';

import { replaceTaskWithTasks } from './File';
import { getSettings } from './Settings';

export enum Status {
    Todo = 'Todo',
    Done = 'Done',
}

export class Task {
    public readonly status: Status;
    public readonly description: string;
    public readonly path: string;
    public readonly indentation: string;
    /** Line number where the section starts that contains this task. */
    public readonly sectionStart: number;
    /** The index of the nth task in its section. */
    public readonly sectionIndex: number;
    /**
     * The original character from within `[]` in the document.
     * Required to be added to the LI the same way obsidian does as a `data-task` attribute.
     */
    public readonly originalStatusCharacter: string;
    public readonly precedingHeader: string | null;
    public readonly dueDate: Moment | null;
    public readonly doneDate: Moment | null;
    public readonly recurrenceRule: RRule | null;

    public static readonly dateFormat = 'YYYY-MM-DD';
    public static readonly taskRegex = /^([\s\t]*)[-*] +\[(.)\] *([^🔁📅📆🗓✅]*)(.*)/u;
    public static readonly dueDateRegex = /[📅📆🗓] ?(\d{4}-\d{2}-\d{2})/u;
    public static readonly doneDateRegex = /✅ ?(\d{4}-\d{2}-\d{2})/u;
    public static readonly recurrenceRegex = /🔁([a-zA-Z0-9, !]+)/u;

    constructor({
        status,
        description,
        path,
        indentation,
        sectionStart,
        sectionIndex,
        originalStatusCharacter,
        precedingHeader,
        dueDate,
        doneDate,
        recurrenceRule,
    }: {
        status: Status;
        description: string;
        path: string;
        indentation: string;
        sectionStart: number;
        sectionIndex: number;
        originalStatusCharacter: string;
        precedingHeader: string | null;
        dueDate: moment.Moment | null;
        doneDate: moment.Moment | null;
        recurrenceRule: RRule | null;
    }) {
        this.status = status;
        this.description = description;
        this.path = path;
        this.indentation = indentation;
        this.sectionStart = sectionStart;
        this.sectionIndex = sectionIndex;
        this.originalStatusCharacter = originalStatusCharacter;
        this.precedingHeader = precedingHeader;
        this.dueDate = dueDate;
        this.doneDate = doneDate;
        this.recurrenceRule = recurrenceRule;
    }

    public static fromLine({
        line,
        path,
        sectionStart,
        sectionIndex,
        precedingHeader,
    }: {
        line: string;
        path: string;
        sectionStart: number;
        sectionIndex: number;
        precedingHeader: string | null;
    }): Task | null {
        const regexMatch = line.match(Task.taskRegex);
        if (regexMatch === null) {
            return null;
        }

        const indentation = regexMatch[1];
        const statusString = regexMatch[2].toLowerCase();
        const description = regexMatch[3].trim();

        const { globalFilter } = getSettings();
        if (!description.includes(globalFilter)) {
            return null;
        }

        let status: Status;
        switch (statusString) {
            case 'x':
                status = Status.Done;
                break;
            default:
                status = Status.Todo;
        }

        let dueDate: Moment | null;
        const dueDateMatch = line.match(Task.dueDateRegex);
        if (dueDateMatch === null) {
            dueDate = null;
        } else {
            dueDate = moment(dueDateMatch[1], Task.dateFormat);
        }

        let doneDate: Moment | null;
        const doneDateMatch = line.match(Task.doneDateRegex);
        if (doneDateMatch === null) {
            doneDate = null;
        } else {
            doneDate = moment(doneDateMatch[1], Task.dateFormat);
        }

        let recurrenceRule: RRule | null;
        const recurrenceMatch = line.match(Task.recurrenceRegex);
        if (recurrenceMatch === null) {
            recurrenceRule = null;
        } else {
            try {
                recurrenceRule = RRule.fromText(recurrenceMatch[1].trim());
            } catch (error) {
                // Could not read recurrence rule. User possibly not done typing.
                recurrenceRule = null;
            }
        }

        const task = new Task({
            status,
            description,
            path,
            indentation,
            sectionStart,
            sectionIndex,
            originalStatusCharacter: statusString,
            precedingHeader,
            dueDate,
            doneDate,
            recurrenceRule,
        });

        return task;
    }

    public async toLi({
        parentUlElement,
        listIndex,
    }: {
        parentUlElement: HTMLElement;
        /** The nth item in this list (including non-tasks). */
        listIndex: number;
    }): Promise<HTMLLIElement> {
        const li: HTMLLIElement = parentUlElement.createEl('li');
        li.addClass('task-list-item');

        let taskAsString = this.toString();
        const { globalFilter, removeGlobalFilter } = getSettings();
        if (removeGlobalFilter) {
            taskAsString = taskAsString.replace(globalFilter, '').trim();
        }

        await MarkdownRenderer.renderMarkdown(
            taskAsString,
            li,
            this.path,
            (null as unknown) as Component,
        );

        // Unwrap the p-tag that was created by the MarkdownRenderer:
        const pElement = li.querySelector('p');
        if (pElement !== null) {
            li.innerHTML = pElement.innerHTML;
            pElement.remove();
        }

        const checkbox = li.createEl('input');
        checkbox.addClass('task-list-item-checkbox');
        checkbox.type = 'checkbox';
        if (this.status !== Status.Todo) {
            checkbox.checked = true;
            li.addClass('is-checked');
        }
        checkbox.onClickEvent((event: MouseEvent) => {
            event.preventDefault();
            // Should be re-rendered as enabled after update in file.
            checkbox.disabled = true;
            const toggledTask = this.toggle();
            replaceTaskWithTasks({
                originalTask: this,
                newTasks: toggledTask,
            });
        });

        li.prepend(checkbox);

        // Set these to be compatible with stock obsidian lists:
        li.setAttr('data-task', this.originalStatusCharacter.trim()); // Trim to ensure empty attribute for space. Same way as obsidian.
        li.setAttr('data-line', listIndex);
        checkbox.setAttr('data-line', listIndex);

        return li;
    }

    public toString(): string {
        const recurrenceRule: string = this.recurrenceRule
            ? ` 🔁 ${this.recurrenceRule.toText()}`
            : '';
        const dueDate: string = this.dueDate
            ? ` 📅 ${this.dueDate.format(Task.dateFormat)}`
            : '';
        const doneDate: string = this.doneDate
            ? ` ✅ ${this.doneDate.format(Task.dateFormat)}`
            : '';

        return `${this.description}${recurrenceRule}${dueDate}${doneDate}`;
    }

    public toFileLineString(): string {
        const statusString = this.status === Status.Done ? 'x' : ' ';
        return `${this.indentation}- [${statusString}] ${this.toString()}`;
    }

    /**
     * Toggles this task and returns the resulting tasks.
     *
     * Toggling can result in more than one returned task in the case of
     * recurrence. If it is a recurring task, the toggled task will be returned
     * toether with the next occurrence in the order `[next, toggled]`. If the
     * task is not recurring, it will return `[toggled]`.
     */
    public toggle(): Task[] {
        const newStatus: Status =
            this.status === Status.Todo ? Status.Done : Status.Todo;
        let newDoneDate = null;
        let nextOccurrence: Moment | undefined;
        if (newStatus !== Status.Todo) {
            newDoneDate = moment();

            // If this task is no longer todo, we need to check if it is recurring:
            if (this.recurrenceRule !== null) {
                // If no due date, next occurrence is after "today".
                const after: Moment =
                    this.dueDate !== null ? this.dueDate : moment();
                // RRule disregards the timezone:
                after.endOf('day').utc(true);
                const next = this.recurrenceRule.after(after.toDate(), false);

                if (next !== null) {
                    // Re-add the timezone that RRule disregarded:
                    nextOccurrence = moment.utc(next);
                }
            }
        }

        const toggledTask = new Task({
            ...this,
            status: newStatus,
            doneDate: newDoneDate,
        });

        const newTasks: Task[] = [];

        if (nextOccurrence !== undefined) {
            const nextTask = new Task({
                ...this,
                dueDate: nextOccurrence,
            });
            newTasks.push(nextTask);
        }

        // Write next occurrence before previous occurrence.
        newTasks.push(toggledTask);

        return newTasks;
    }
}
