import { Component, MarkdownRenderer } from 'obsidian';
import { RRule } from 'rrule';

import { replaceTaskWithTasks } from './File';
import { getSettings } from './Settings';
import type { Moment } from 'moment';

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
    /** The blockLink is a "^" annotation after the dates/recurrence rules. */
    public readonly blockLink: string;

    public static readonly dateFormat = 'YYYY-MM-DD';
    public static readonly taskRegex =
        /^([\s\t]*)[-*] +\[(.)\] *([^🔁📅📆🗓✅]*)(.*)/u;
    public static readonly dueDateRegex = /[📅📆🗓] ?(\d{4}-\d{2}-\d{2})/u;
    public static readonly doneDateRegex = /✅ ?(\d{4}-\d{2}-\d{2})/u;
    public static readonly recurrenceRegex = /🔁([a-zA-Z0-9, !]+)/u;
    public static readonly blockLinkRegex = / \^[a-zA-Z0-9-]+$/u;

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
        blockLink,
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
        blockLink: string;
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
        this.blockLink = blockLink;
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

        const blockLinkMatch = line.match(this.blockLinkRegex);
        const blockLink = blockLinkMatch !== null ? blockLinkMatch[0] : '';

        let description = regexMatch[3].trim();
        if (blockLink !== '') {
            description = description.replace(this.blockLinkRegex, '');
        }

        const { globalFilter } = getSettings();
        if (!description.includes(globalFilter)) {
            return null;
        }

        let status: Status;
        switch (statusString) {
            case ' ':
                status = Status.Todo;
                break;
            default:
                status = Status.Done;
        }

        let dueDate: Moment | null;
        const dueDateMatch = line.match(Task.dueDateRegex);
        if (dueDateMatch === null) {
            dueDate = null;
        } else {
            dueDate = window.moment(dueDateMatch[1], Task.dateFormat);
        }

        let doneDate: Moment | null;
        const doneDateMatch = line.match(Task.doneDateRegex);
        if (doneDateMatch === null) {
            doneDate = null;
        } else {
            doneDate = window.moment(doneDateMatch[1], Task.dateFormat);
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
            blockLink,
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
        li.addClasses(['task-list-item', 'plugin-tasks-list-item']);

        let taskAsString = this.toString();
        const { globalFilter, removeGlobalFilter } = getSettings();
        if (removeGlobalFilter) {
            taskAsString = taskAsString.replace(globalFilter, '').trim();
        }

        await MarkdownRenderer.renderMarkdown(
            taskAsString,
            li,
            this.path,
            null as unknown as Component,
        );

        // Unwrap the p-tag that was created by the MarkdownRenderer:
        const pElement = li.querySelector('p');
        if (pElement !== null) {
            while (pElement.firstChild) {
                li.insertBefore(pElement.firstChild, pElement);
            }
            pElement.remove();
        }

        // Remove an empty trailing p-tag that the MarkdownRenderer appends when there is a block link:
        li.findAll('p').forEach((pElement) => {
            if (!pElement.hasChildNodes()) {
                pElement.remove();
            }
        });

        const checkbox = li.createEl('input');
        checkbox.addClass('task-list-item-checkbox');
        checkbox.type = 'checkbox';
        if (this.status !== Status.Todo) {
            checkbox.checked = true;
            li.addClass('is-checked');
        }
        checkbox.onClickEvent((event: MouseEvent) => {
            event.preventDefault();
            // It is required to stop propagation so that obsidian won't write the file with the
            // checkbox (un)checked. Obsidian would write after us and overwrite our change.
            event.stopPropagation();

            // Should be re-rendered as enabled after update in file.
            checkbox.disabled = true;
            const toggledTasks = this.toggle();
            replaceTaskWithTasks({
                originalTask: this,
                newTasks: toggledTasks,
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

        return `${this.description}${recurrenceRule}${dueDate}${doneDate}${this.blockLink}`;
    }

    public toFileLineString(): string {
        return `${this.indentation}- [${
            this.originalStatusCharacter
        }] ${this.toString()}`;
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
            newDoneDate = window.moment();

            // If this task is no longer todo, we need to check if it is recurring:
            if (this.recurrenceRule !== null) {
                // If no due date, next occurrence is after "today".
                const dtStart: Moment =
                    this.dueDate !== null ? this.dueDate : window.moment();
                // RRule disregards the timezone:
                dtStart.endOf('day').utc(true);

                // Create a new rrule with `dtstart` set so that the date of
                // the new occurrence is calculated based on the original due
                // date and not based on today.
                const rrule = new RRule({
                    ...this.recurrenceRule.options,
                    dtstart: dtStart.toDate(),
                });

                // The next occurrence should happen after today or the due
                // date, whatever is later.
                const today = window.moment().endOf('day').utc(true);
                const after = today.isAfter(dtStart) ? today : dtStart;
                const next = rrule.after(after.toDate(), false);

                if (next !== null) {
                    // Re-add the timezone that RRule disregarded:
                    nextOccurrence = window.moment.utc(next);
                }
            }
        }

        const toggledTask = new Task({
            ...this,
            status: newStatus,
            doneDate: newDoneDate,
            originalStatusCharacter: newStatus === Status.Done ? 'x' : ' ',
        });

        const newTasks: Task[] = [];

        if (nextOccurrence !== undefined) {
            const nextTask = new Task({
                ...this,
                dueDate: nextOccurrence,
                // New occurrences cannot have the same block link.
                // And random block links don't help.
                blockLink: '',
            });
            newTasks.push(nextTask);
        }

        // Write next occurrence before previous occurrence.
        newTasks.push(toggledTask);

        return newTasks;
    }
}
