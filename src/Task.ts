import type { Moment } from 'moment';
import { Component, MarkdownRenderer } from 'obsidian';
import { StatusRegistry } from './StatusRegistry';
import type { Status } from './Status';
import { replaceTaskWithTasks } from './File';
import { LayoutOptions } from './LayoutOptions';
import { Recurrence } from './Recurrence';
import { getSettings, isFeatureEnabled } from './Settings';
import { Urgency } from './Urgency';
import { Feature } from './Feature';

/**
 * When sorting, make sure low always comes after none. This way any tasks with low will be below any exiting
 * tasks that have no priority which would be the default.
 *
 * @export
 * @enum {number}
 */
export enum Priority {
    High = '1',
    Medium = '2',
    None = '3',
    Low = '4',
}

/**
 * Task encapsulates the properties of the MarkDown task along with
 * the extensions provided by this plugin. This is used to parse and
 * generate the markdown task for all updates and replacements.
 *
 * @export
 * @class Task
 */
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

    public readonly tags: string[];

    public readonly priority: Priority;

    public readonly startDate: Moment | null;
    public readonly scheduledDate: Moment | null;
    public readonly dueDate: Moment | null;
    public readonly doneDate: Moment | null;

    public readonly recurrence: Recurrence | null;
    /** The blockLink is a "^" annotation after the dates/recurrence rules. */
    public readonly blockLink: string;

    public static readonly dateFormat = 'YYYY-MM-DD';

    // Main regex for parsing a line. It matches the following:
    // - Indentation
    // - Status character
    // - Rest of task after checkbox markdown
    public static readonly taskRegex = /^([\s\t]*)[-*] +\[(.)\] *(.*)/u;

    // Match on block link at end.
    public static readonly blockLinkRegex = / \^[a-zA-Z0-9-]+$/u;

    // The following regex's end with `$` because they will be matched and
    // removed from the end until none are left.
    public static readonly priorityRegex = /([⏫🔼🔽])$/u;
    public static readonly startDateRegex = /🛫 ?(\d{4}-\d{2}-\d{2})$/u;
    public static readonly scheduledDateRegex = /[⏳⌛] ?(\d{4}-\d{2}-\d{2})$/u;
    public static readonly dueDateRegex = /[📅📆🗓] ?(\d{4}-\d{2}-\d{2})$/u;
    public static readonly doneDateRegex = /✅ ?(\d{4}-\d{2}-\d{2})$/u;
    public static readonly recurrenceRegex = /🔁 ?([a-zA-Z0-9, !]+)$/iu;

    // Regex to match all hash tags, basically hash followed by anything but the characters in the negation.
    // To ensure URLs are not caught it is looking of beginning of string tag and any
    // tag that has a space in front of it. Any # that has a character in front
    // of it will be ignored.
    // EXAMPLE:
    // description: '#dog #car http://www/ddd#ere #house'
    // matches: #dog, #car, #house
    public static readonly hashTags = /(^|\s)#[^ !@#$%^&*(),.?":{}|<>]*/g;

    private _urgency: number | null = null;

    constructor({
        status,
        description,
        path,
        indentation,
        sectionStart,
        sectionIndex,
        precedingHeader,
        priority,
        startDate,
        scheduledDate,
        dueDate,
        doneDate,
        recurrence,
        blockLink,
        tags,
    }: {
        status: Status;
        description: string;
        path: string;
        indentation: string;
        sectionStart: number;
        sectionIndex: number;
        precedingHeader: string | null;
        priority: Priority;
        startDate: moment.Moment | null;
        scheduledDate: moment.Moment | null;
        dueDate: moment.Moment | null;
        doneDate: moment.Moment | null;
        recurrence: Recurrence | null;
        blockLink: string;
        tags: string[] | [];
    }) {
        this.status = status;
        this.description = description;
        this.path = path;
        this.indentation = indentation;
        this.sectionStart = sectionStart;
        this.sectionIndex = sectionIndex;
        this.precedingHeader = precedingHeader;

        this.tags = tags;

        this.priority = priority;

        this.startDate = startDate;
        this.scheduledDate = scheduledDate;
        this.dueDate = dueDate;
        this.doneDate = doneDate;

        this.recurrence = recurrence;
        this.blockLink = blockLink;
    }

    /**
     * Takes the given line from a obsidian note and returns a Task object.
     *
     * @static
     * @param {string} line - The full line in the note to parse.
     * @param {string} path - Path to the note in obsidian.
     * @param {number} sectionStart - Line number where the section starts that contains this task.
     * @param {number} sectionIndex - The index of the nth task in its section.
     * @param {(string | null)} precedingHeader - The header before this task.
     * @return {*}  {(Task | null)}
     * @memberof Task
     */
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
        // Check the line to see if it is a markdown task.
        const regexMatch = line.match(Task.taskRegex);
        if (regexMatch === null) {
            return null;
        }

        // match[3] includes the whole body of the task after the brackets.
        const body = regexMatch[3].trim();

        // return if task does not have the global filter. Do this before processing
        // rest of match to improve performance.
        const { globalFilter } = getSettings();
        if (!body.includes(globalFilter)) {
            return null;
        }

        // Global filter is applied via edit or to string and no
        // longer needs to be on the description. If this happens
        // there may be a double space. So all double spaces are made
        // single like the UI processing.
        let description = body
            .replace(globalFilter, '')
            .replace('  ', ' ')
            .trim();
        const indentation = regexMatch[1];

        // Get the status of the task.
        const statusString = regexMatch[2].toLowerCase();
        const status = StatusRegistry.getInstance().byIndicator(statusString);
        if (status === null) {
            throw new Error(`Missing status indicator: ${statusString}`);
        }

        // Match for block link and remove if found. Always expected to be
        // at the end of the line.
        const blockLinkMatch = description.match(this.blockLinkRegex);
        const blockLink = blockLinkMatch !== null ? blockLinkMatch[0] : '';

        if (blockLink !== '') {
            description = description.replace(this.blockLinkRegex, '').trim();
        }

        // Keep matching and removing special strings from the end of the
        // description in any order. The loop should only run once if the
        // strings are in the expected order after the description.
        let matched: boolean;
        let priority: Priority = Priority.None;
        let startDate: Moment | null = null;
        let scheduledDate: Moment | null = null;
        let dueDate: Moment | null = null;
        let doneDate: Moment | null = null;
        let recurrence: Recurrence | null = null;
        let tags: any = [];
        // Add a "max runs" failsafe to never end in an endless loop:
        const maxRuns = 7;
        let runs = 0;
        do {
            matched = false;
            const priorityMatch = description.match(Task.priorityRegex);
            if (priorityMatch !== null) {
                switch (priorityMatch[1]) {
                    case '🔽':
                        priority = Priority.Low;
                        break;
                    case '🔼':
                        priority = Priority.Medium;
                        break;
                    case '⏫':
                        priority = Priority.High;
                        break;
                }

                description = description
                    .replace(Task.priorityRegex, '')
                    .trim();
                matched = true;
            }

            const doneDateMatch = description.match(Task.doneDateRegex);
            if (doneDateMatch !== null) {
                doneDate = window.moment(doneDateMatch[1], Task.dateFormat);
                description = description
                    .replace(Task.doneDateRegex, '')
                    .trim();
                matched = true;
            }

            const dueDateMatch = description.match(Task.dueDateRegex);
            if (dueDateMatch !== null) {
                dueDate = window.moment(dueDateMatch[1], Task.dateFormat);
                description = description.replace(Task.dueDateRegex, '').trim();
                matched = true;
            }

            const scheduledDateMatch = description.match(
                Task.scheduledDateRegex,
            );
            if (scheduledDateMatch !== null) {
                scheduledDate = window.moment(
                    scheduledDateMatch[1],
                    Task.dateFormat,
                );
                description = description
                    .replace(Task.scheduledDateRegex, '')
                    .trim();
                matched = true;
            }

            const startDateMatch = description.match(Task.startDateRegex);
            if (startDateMatch !== null) {
                startDate = window.moment(startDateMatch[1], Task.dateFormat);
                description = description
                    .replace(Task.startDateRegex, '')
                    .trim();
                matched = true;
            }

            const recurrenceMatch = description.match(Task.recurrenceRegex);
            if (recurrenceMatch !== null) {
                recurrence = Recurrence.fromText({
                    recurrenceRuleText: recurrenceMatch[1].trim(),
                    startDate,
                    scheduledDate,
                    dueDate,
                });

                description = description
                    .replace(Task.recurrenceRegex, '')
                    .trim();
                matched = true;
            }

            runs++;
        } while (matched && runs <= maxRuns);

        // Tags are found in the string and pulled out but not removed,
        // so when returning the entire task it will match what the user
        // entered.
        // The global filter will be removed from the collection.
        const hashTagMatch = description.match(this.hashTags);
        if (hashTagMatch !== null) {
            tags = hashTagMatch
                .filter((tag) => tag !== globalFilter)
                .map((tag) => tag.trim());
        }

        const task = new Task({
            status,
            description,
            path,
            indentation,
            sectionStart,
            sectionIndex,
            precedingHeader,
            priority,
            startDate,
            scheduledDate,
            dueDate,
            doneDate,
            recurrence,
            blockLink,
            tags,
        });

        return task;
    }

    /**
     * Renders a list item the same way Obsidian does. Note that anything between the
     * square brackets means it is 'checked' this is not the same as done.
     *
     * @param {{
     *         parentUlElement: HTMLElement;
     *         listIndex: number;
     *         layoutOptions?: LayoutOptions;
     *         isFilenameUnique?: boolean;
     *     }} {
     *         parentUlElement,
     *         listIndex,
     *         layoutOptions,
     *         isFilenameUnique,
     *     }
     * @return {*}  {Promise<HTMLLIElement>}
     * @memberof Task
     */
    public async toLi({
        parentUlElement,
        listIndex,
        layoutOptions,
        isFilenameUnique,
    }: {
        parentUlElement: HTMLElement;
        /** The nth item in this list (including non-tasks). */
        listIndex: number;
        layoutOptions?: LayoutOptions;
        isFilenameUnique?: boolean;
    }): Promise<HTMLLIElement> {
        let taskAsString = this.toString(layoutOptions);
        const { globalFilter, removeGlobalFilter } = getSettings();

        // Hide the global filter when rendering the query results.
        if (removeGlobalFilter) {
            taskAsString = taskAsString.replace(globalFilter, '').trim();
        }

        // Generate top level list item.
        const li: HTMLLIElement = parentUlElement.createEl('li');
        li.setAttr('data-line', listIndex);
        li.setAttr('data-task', this.status.indicator.trim()); // Trim to ensure empty attribute for space. Same way as obsidian.
        li.addClasses(['task-list-item', 'plugin-tasks-list-item']);
        if (this.status.indicator !== ' ') {
            li.addClass('is-checked');
        }

        const textSpan = li.createSpan();
        textSpan.addClass('tasks-list-text');

        await MarkdownRenderer.renderMarkdown(
            taskAsString,
            textSpan,
            this.path,
            null as unknown as Component,
        );

        // If the task is a block quote, the block quote wraps the p-tag that contains the content.
        // In that case, we need to unwrap the p-tag *inside* the surrounding block quote.
        // Otherwise, we unwrap the p-tag as a direct descendant of the textSpan.
        const blockQuote = textSpan.querySelector('blockquote');
        const directParentOfPTag = blockQuote ?? textSpan;

        // Unwrap the p-tag that was created by the MarkdownRenderer:
        const pElement = directParentOfPTag.querySelector('p');
        if (pElement !== null) {
            while (pElement.firstChild) {
                directParentOfPTag.insertBefore(pElement.firstChild, pElement);
            }
            pElement.remove();
        }

        // Remove an empty trailing p-tag that the MarkdownRenderer appends when there is a block link:
        textSpan.findAll('p').forEach((pElement) => {
            if (!pElement.hasChildNodes()) {
                pElement.remove();
            }
        });

        // Remove the footnote that the MarkdownRenderer appends when there is a footnote in the task:
        textSpan.findAll('.footnotes').forEach((footnoteElement) => {
            footnoteElement.remove();
        });

        const checkbox = li.createEl('input');
        checkbox.setAttr('data-line', listIndex);
        if (this.status.indicator !== ' ') {
            checkbox.checked = true;
        }
        checkbox.type = 'checkbox';
        checkbox.addClass('task-list-item-checkbox');

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

        if (layoutOptions?.shortMode) {
            this.addTooltip({ element: textSpan, isFilenameUnique });
        }

        return li;
    }

    /**
     * Returns a string representation of the task. This is the entire body after the
     * markdown task prefix. ( - [ ] )
     *
     * @param {LayoutOptions} [layoutOptions]
     * @return {*}  {string}
     * @memberof Task
     */
    public toString(layoutOptions?: LayoutOptions): string {
        layoutOptions = layoutOptions ?? new LayoutOptions();

        let taskString = this.description.trim();
        const { globalFilter } = getSettings();

        if (isFeatureEnabled(Feature.APPEND_GLOBAL_FILTER.internalName)) {
            taskString = `${taskString} ${globalFilter}`.trim();
        } else {
            // Default is to have filter at front.
            taskString = `${globalFilter} ${taskString}`.trim();
        }

        if (!layoutOptions.hidePriority) {
            let priority: string = '';

            if (this.priority === Priority.High) {
                priority = ' ⏫';
            } else if (this.priority === Priority.Medium) {
                priority = ' 🔼';
            } else if (this.priority === Priority.Low) {
                priority = ' 🔽';
            }

            taskString += priority;
        }

        if (!layoutOptions.hideRecurrenceRule && this.recurrence) {
            const recurrenceRule: string = layoutOptions.shortMode
                ? ' 🔁'
                : ` 🔁 ${this.recurrence.toText()}`;
            taskString += recurrenceRule;
        }

        if (!layoutOptions.hideStartDate && this.startDate) {
            const startDate: string = layoutOptions.shortMode
                ? ' 🛫'
                : ` 🛫 ${this.startDate.format(Task.dateFormat)}`;
            taskString += startDate;
        }

        if (!layoutOptions.hideScheduledDate && this.scheduledDate) {
            const scheduledDate: string = layoutOptions.shortMode
                ? ' ⏳'
                : ` ⏳ ${this.scheduledDate.format(Task.dateFormat)}`;
            taskString += scheduledDate;
        }

        if (!layoutOptions.hideDueDate && this.dueDate) {
            const dueDate: string = layoutOptions.shortMode
                ? ' 📅'
                : ` 📅 ${this.dueDate.format(Task.dateFormat)}`;
            taskString += dueDate;
        }

        if (!layoutOptions.hideDoneDate && this.doneDate) {
            const doneDate: string = layoutOptions.shortMode
                ? ' ✅'
                : ` ✅ ${this.doneDate.format(Task.dateFormat)}`;
            taskString += doneDate;
        }

        const blockLink: string = this.blockLink ?? '';
        taskString += blockLink;

        return taskString;
    }

    /**
     * Returns the Task as a list item with a checkbox.
     *
     * @return {*}  {string}
     * @memberof Task
     */
    public toFileLineString(): string {
        return `${this.indentation}- [${
            this.status.indicator
        }] ${this.toString().trim()}`;
    }

    /**
     * Toggles this task and returns the resulting tasks.
     *
     * Toggling can result in more than one returned task in the case of
     * recurrence. If it is a recurring task, the toggled task will be returned
     * together with the next occurrence in the order `[next, toggled]`. If the
     * task is not recurring, it will return `[toggled]`.
     */
    public toggle(): Task[] {
        const newStatus = StatusRegistry.getInstance().getNextStatus(
            this.status,
        );

        let newDoneDate = null;

        let nextOccurrence: {
            startDate: Moment | null;
            scheduledDate: Moment | null;
            dueDate: Moment | null;
        } | null = null;

        if (newStatus.isCompleted()) {
            // Set done date only if setting value is true
            const { setDoneDate } = getSettings();
            if (setDoneDate) {
                newDoneDate = window.moment();
            }

            // If this task is no longer todo, we need to check if it is recurring:
            if (this.recurrence !== null) {
                nextOccurrence = this.recurrence.next();
            }
        }

        const toggledTask = new Task({
            ...this,
            status: newStatus,
            doneDate: newDoneDate,
        });

        const newTasks: Task[] = [];

        if (nextOccurrence !== null) {
            const nextTask = new Task({
                ...this,
                ...nextOccurrence,
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

    public get urgency(): number {
        if (this._urgency === null) {
            this._urgency = Urgency.calculate(this);
        }

        return this._urgency;
    }

    public get filename(): string | null {
        const fileNameMatch = this.path.match(/([^/]+)\.md$/);
        if (fileNameMatch !== null) {
            return fileNameMatch[1];
        } else {
            return null;
        }
    }

    /**
     * Returns the text that should be displayed to the user when linking to the origin of the task
     *
     * @param isFilenameUnique {boolean|null} Whether the name of the file that contains the task is unique in the vault.
     *                                        If it is undefined, the outcome will be the same as with a unique file name: the file name only.
     *                                        If set to `true`, the full path will be returned.
     */
    public getLinkText({
        isFilenameUnique,
    }: {
        isFilenameUnique: boolean | undefined;
    }): string | null {
        let linkText: string | null;
        if (isFilenameUnique) {
            linkText = this.filename;
        } else {
            // A slash at the beginning indicates this is a path, not a filename.
            linkText = '/' + this.path;
        }

        if (linkText === null) {
            return null;
        }

        // Otherwise, this wouldn't provide additional information and only take up space.
        if (
            this.precedingHeader !== null &&
            this.precedingHeader !== linkText
        ) {
            linkText = linkText + ' > ' + this.precedingHeader;
        }

        return linkText;
    }

    private addTooltip({
        element,
        isFilenameUnique,
    }: {
        element: HTMLElement;
        isFilenameUnique: boolean | undefined;
    }): void {
        element.addEventListener('mouseenter', () => {
            const tooltip = element.createDiv();
            tooltip.addClasses(['tooltip', 'mod-right']);

            if (this.recurrence) {
                const recurrenceDiv = tooltip.createDiv();
                recurrenceDiv.setText(`🔁 ${this.recurrence.toText()}`);
            }

            if (this.startDate) {
                const startDateDiv = tooltip.createDiv();
                startDateDiv.setText(
                    Task.toTooltipDate({
                        signifier: '🛫',
                        date: this.startDate,
                    }),
                );
            }

            if (this.scheduledDate) {
                const scheduledDateDiv = tooltip.createDiv();
                scheduledDateDiv.setText(
                    Task.toTooltipDate({
                        signifier: '⏳',
                        date: this.scheduledDate,
                    }),
                );
            }

            if (this.dueDate) {
                const dueDateDiv = tooltip.createDiv();
                dueDateDiv.setText(
                    Task.toTooltipDate({
                        signifier: '📅',
                        date: this.dueDate,
                    }),
                );
            }

            if (this.doneDate) {
                const doneDateDiv = tooltip.createDiv();
                doneDateDiv.setText(
                    Task.toTooltipDate({
                        signifier: '✅',
                        date: this.doneDate,
                    }),
                );
            }

            const linkText = this.getLinkText({ isFilenameUnique });
            if (linkText) {
                const backlinkDiv = tooltip.createDiv();
                backlinkDiv.setText(`🔗 ${linkText}`);
            }

            element.addEventListener('mouseleave', () => {
                tooltip.remove();
            });
        });
    }

    private static toTooltipDate({
        signifier,
        date,
    }: {
        signifier: string;
        date: Moment;
    }): string {
        return `${signifier} ${date.format(Task.dateFormat)} (${date.from(
            window.moment().startOf('day'),
        )})`;
    }
}
