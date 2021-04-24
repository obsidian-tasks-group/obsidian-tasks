import moment, { Moment } from 'moment';
import { Component, MarkdownRenderer } from 'obsidian';

import { writeTask } from './File';
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
    public readonly precedingHeader: string | null;
    public readonly dueDate: moment.Moment | null;
    public readonly doneDate: moment.Moment | null;

    public static readonly dateFormat = 'YYYY-MM-DD';
    public static readonly taskRegex = /^([\s\t]*)[-*] +\[(.)\] *([^📅📆🗓✅]*)(.*)/u;
    public static readonly dueDateRegex = /[📅📆🗓] ?(\d{4}-\d{2}-\d{2})/u;
    public static readonly doneDateRegex = /✅ ?(\d{4}-\d{2}-\d{2})/u;

    constructor({
        status,
        description,
        path,
        indentation,
        sectionStart,
        sectionIndex,
        precedingHeader,
        dueDate,
        doneDate,
    }: {
        status: Status;
        description: string;
        path: string;
        indentation: string;
        sectionStart: number;
        sectionIndex: number;
        precedingHeader: string | null;
        dueDate: moment.Moment | null;
        doneDate: moment.Moment | null;
    }) {
        this.status = status;
        this.description = description;
        this.path = path;
        this.indentation = indentation;
        this.sectionStart = sectionStart;
        this.sectionIndex = sectionIndex;
        this.precedingHeader = precedingHeader;
        this.dueDate = dueDate;
        this.doneDate = doneDate;
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

        const task = new Task({
            status,
            description,
            path,
            indentation,
            sectionStart,
            sectionIndex,
            precedingHeader,
            dueDate,
            doneDate,
        });

        return task;
    }

    public async toLi({
        parentUlElement,
    }: {
        parentUlElement: HTMLElement;
    }): Promise<HTMLLIElement> {
        const li: HTMLLIElement = parentUlElement.createEl('li');
        li.addClass('task-list-item');
        li.setAttr('data-task', '');

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
            writeTask({
                task: toggledTask,
            });
        });

        li.prepend(checkbox);

        return li;
    }

    public toString(): string {
        const dueDate: string = this.dueDate
            ? ` 📅 ${this.dueDate.format(Task.dateFormat)}`
            : '';
        const doneDate: string = this.doneDate
            ? ` ✅ ${this.doneDate.format(Task.dateFormat)}`
            : '';

        return `${this.description}${dueDate}${doneDate}`;
    }

    public toFileLineString(): string {
        const statusString = this.status === Status.Done ? 'x' : ' ';
        return `${this.indentation}- [${statusString}] ${this.toString()}`;
    }

    /**
     * @returns {Task} a new task with the status toggled.
     */
    public toggle(): Task {
        const newStatus: Status =
            this.status === Status.Todo ? Status.Done : Status.Todo;
        let newDoneDate = null;
        if (newStatus !== Status.Todo) {
            newDoneDate = moment();
        }

        return new Task({ ...this, status: newStatus, doneDate: newDoneDate });
    }
}
