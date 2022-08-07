import type { Moment } from 'moment';
import { Component, MarkdownRenderer } from 'obsidian';
import { replaceTaskWithTasks } from './File';
import { LayoutOptions } from './LayoutOptions';
import { Recurrence } from './Recurrence';
import { getSettings } from './config/Settings';
import { Urgency } from './Urgency';
import { Sort } from './Sort';

/**
 * Collection of status types supported by the plugin.
 * TODO: Make this a class so it can support other types and easier mapping to status character.
 * @export
 * @enum {number}
 */
export enum Status {
    Todo = 'Todo',
    Done = 'Done',
}

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

export const prioritySymbols = {
    High: '⏫',
    Medium: '🔼',
    Low: '🔽',
    None: '',
};

export const recurrenceSymbol = '🔁';
export const startDateSymbol = '🛫';
export const scheduledDateSymbol = '⏳';
export const dueDateSymbol = '📅';
export const doneDateSymbol = '✅';

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
    /**
     * The original character from within `[]` in the document.
     * Required to be added to the LI the same way obsidian does as a `data-task` attribute.
     */
    public readonly originalStatusCharacter: string;
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
    // - Indentation (including > for potentially nested blockquotes or Obsidian callouts)
    // - Status character
    // - Rest of task after checkbox markdown
    public static readonly taskRegex = /^([\s\t>]*)[-*] +\[(.)\] *(.*)/u;

    // Match on block link at end.
    public static readonly blockLinkRegex = / \^[a-zA-Z0-9-]+$/u;

    // The following regex's end with `$` because they will be matched and
    // removed from the end until none are left.
    public static readonly priorityRegex = /([⏫🔼🔽])$/u;
    public static readonly startDateRegex = /🛫 *(\d{4}-\d{2}-\d{2})$/u;
    public static readonly scheduledDateRegex = /[⏳⌛] *(\d{4}-\d{2}-\d{2})$/u;
    public static readonly dueDateRegex = /[📅📆🗓] *(\d{4}-\d{2}-\d{2})$/u;
    public static readonly doneDateRegex = /✅ *(\d{4}-\d{2}-\d{2})$/u;
    public static readonly recurrenceRegex = /🔁 ?([a-zA-Z0-9, !]+)$/iu;

    // Regex to match all hash tags, basically hash followed by anything but the characters in the negation.
    // To ensure URLs are not caught it is looking of beginning of string tag and any
    // tag that has a space in front of it. Any # that has a character in front
    // of it will be ignored.
    // EXAMPLE:
    // description: '#dog #car http://www/ddd#ere #house'
    // matches: #dog, #car, #house
    public static readonly hashTags = /(^|\s)#[^ !@#$%^&*(),.?":{}|<>]*/g;
    public static readonly hashTagsFromEnd = new RegExp(
        this.hashTags.source + '$',
    );

    private _urgency: number | null = null;

    constructor({
        status,
        description,
        path,
        indentation,
        sectionStart,
        sectionIndex,
        originalStatusCharacter,
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
        originalStatusCharacter: string;
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
        this.originalStatusCharacter = originalStatusCharacter;
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

        let description = body;
        const indentation = regexMatch[1];

        // Get the status of the task, only todo and done supported.
        const statusString = regexMatch[2].toLowerCase();
        let status: Status;
        switch (statusString) {
            case ' ':
                status = Status.Todo;
                break;
            default:
                status = Status.Done;
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
        let recurrenceRule: string = '';
        let recurrence: Recurrence | null = null;
        let tags: any = [];
        // Tags that are removed from the end while parsing, but we want to add them back for being part of the description.
        // In the original task description they are possibly mixed with other components
        // (e.g. #tag1 <due date> #tag2), they do not have to all trail all task components,
        // but eventually we want to paste them back to the task description at the end
        let trailingTags = '';
        // Add a "max runs" failsafe to never end in an endless loop:
        const maxRuns = 20;
        let runs = 0;
        do {
            matched = false;
            const priorityMatch = description.match(Task.priorityRegex);
            if (priorityMatch !== null) {
                switch (priorityMatch[1]) {
                    case prioritySymbols.Low:
                        priority = Priority.Low;
                        break;
                    case prioritySymbols.Medium:
                        priority = Priority.Medium;
                        break;
                    case prioritySymbols.High:
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
                // Save the recurrence rule, but *do not parse it yet*.
                // Creating the Recurrence object requires a reference date (e.g. a due date),
                // and it might appear in the next (earlier in the line) tokens to parse
                recurrenceRule = recurrenceMatch[1].trim();
                description = description
                    .replace(Task.recurrenceRegex, '')
                    .trim();
                matched = true;
            }

            // Match tags from the end to allow users to mix the various task components with
            // tags. These tags will be added back to the description below
            const tagsMatch = description.match(Task.hashTagsFromEnd);
            if (tagsMatch != null) {
                description = description
                    .replace(Task.hashTagsFromEnd, '')
                    .trim();
                matched = true;
                const tagName = tagsMatch[0].trim();
                // Adding to the left because the matching is done right-to-left
                trailingTags =
                    trailingTags.length > 0
                        ? [tagName, trailingTags].join(' ')
                        : tagName;
            }

            runs++;
        } while (matched && runs <= maxRuns);

        // Now that we have all the task details, parse the recurrence rule if we found any
        if (recurrenceRule.length > 0) {
            recurrence = Recurrence.fromText({
                recurrenceRuleText: recurrenceRule,
                startDate,
                scheduledDate,
                dueDate,
            });
        }

        // Add back any trailing tags to the description. We removed them so we can parse the rest of the
        // components but now we want them back.
        // The goal is for a task of them form 'Do something #tag1 (due) tomorrow #tag2 (start) today'
        // to actually have the description 'Do something #tag1 #tag2'
        if (trailingTags.length > 0) description += ' ' + trailingTags;

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

        return new Task({
            status,
            description,
            path,
            indentation,
            sectionStart,
            sectionIndex,
            originalStatusCharacter: statusString,
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
    }

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
        const li: HTMLLIElement = parentUlElement.createEl('li');
        li.addClasses(['task-list-item', 'plugin-tasks-list-item']);

        let taskAsString = this.toString(layoutOptions);
        const { globalFilter, removeGlobalFilter } = getSettings();
        if (removeGlobalFilter) {
            taskAsString = taskAsString.replace(globalFilter, '').trim();
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

        if (layoutOptions?.shortMode) {
            this.addTooltip({ element: textSpan, isFilenameUnique });
        }

        return li;
    }

    /**
     *
     *
     * @param {LayoutOptions} [layoutOptions]
     * @return {*}  {string}
     * @memberof Task
     */
    public toString(layoutOptions?: LayoutOptions): string {
        layoutOptions = layoutOptions ?? new LayoutOptions();
        let taskString = this.description;

        if (!layoutOptions.hidePriority) {
            let priority: string = '';

            if (this.priority === Priority.High) {
                priority = ' ' + prioritySymbols.High;
            } else if (this.priority === Priority.Medium) {
                priority = ' ' + prioritySymbols.Medium;
            } else if (this.priority === Priority.Low) {
                priority = ' ' + prioritySymbols.Low;
            }

            taskString += priority;
        }

        if (!layoutOptions.hideRecurrenceRule && this.recurrence) {
            const recurrenceRule: string = layoutOptions.shortMode
                ? ' ' + recurrenceSymbol
                : ` ${recurrenceSymbol} ${this.recurrence.toText()}`;
            taskString += recurrenceRule;
        }

        if (!layoutOptions.hideStartDate && this.startDate) {
            const startDate: string = layoutOptions.shortMode
                ? ' ' + startDateSymbol
                : ` ${startDateSymbol} ${this.startDate.format(
                      Task.dateFormat,
                  )}`;
            taskString += startDate;
        }

        if (!layoutOptions.hideScheduledDate && this.scheduledDate) {
            const scheduledDate: string = layoutOptions.shortMode
                ? ' ' + scheduledDateSymbol
                : ` ${scheduledDateSymbol} ${this.scheduledDate.format(
                      Task.dateFormat,
                  )}`;
            taskString += scheduledDate;
        }

        if (!layoutOptions.hideDueDate && this.dueDate) {
            const dueDate: string = layoutOptions.shortMode
                ? ' ' + dueDateSymbol
                : ` ${dueDateSymbol} ${this.dueDate.format(Task.dateFormat)}`;
            taskString += dueDate;
        }

        if (!layoutOptions.hideDoneDate && this.doneDate) {
            const doneDate: string = layoutOptions.shortMode
                ? ' ' + doneDateSymbol
                : ` ${doneDateSymbol} ${this.doneDate.format(Task.dateFormat)}`;
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
            this.originalStatusCharacter
        }] ${this.toString()}`;
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
        const newStatus: Status =
            this.status === Status.Todo ? Status.Done : Status.Todo;

        let newDoneDate = null;

        let nextOccurrence: {
            startDate: Moment | null;
            scheduledDate: Moment | null;
            dueDate: Moment | null;
        } | null = null;

        if (newStatus !== Status.Todo) {
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
            originalStatusCharacter: newStatus === Status.Done ? 'x' : ' ',
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

    /**
     * Compare two lists of Task objects, and report whether their
     * tasks are identical in the same order.
     *
     * This can be useful for optimising code if it is guaranteed that
     * there are no possible differences in the tasks in a file
     * after an edit, for example.
     *
     * If any field is different in any task, it will return false.
     *
     * @param oldTasks
     * @param newTasks
     */
    static tasksListsIdentical(oldTasks: Task[], newTasks: Task[]): boolean {
        if (oldTasks.length !== newTasks.length) {
            return false;
        }
        return oldTasks.every((oldTask, index) =>
            oldTask.identicalTo(newTasks[index]),
        );
    }

    /**
     * Compare all the fields in another Task, to detect any differences from this one.
     *
     * If any field is different in any way, it will return false.
     *
     * This is used in some optimisations, to avoid work if an edit to file
     * does not change any tasks, so it is vital that its definition
     * of identical is very strict.
     *
     * @param other
     */
    public identicalTo(other: Task) {
        // Based on ideas from koala. AquaCat and javalent in Discord:
        // https://discord.com/channels/686053708261228577/840286264964022302/996735200388186182
        // and later.
        //
        // Note: sectionStart changes every time a line is added or deleted before
        //       any of the tasks in a file. This does mean that redrawing of tasks blocks
        //       happens more often than is ideal.
        let args: Array<keyof Task> = [
            'status',
            'description',
            'path',
            'indentation',
            'sectionStart',
            'sectionIndex',
            'originalStatusCharacter',
            'precedingHeader',
            'priority',
            'blockLink',
        ];
        for (const el of args) {
            if (this[el] !== other[el]) return false;
        }

        // Compare tags
        if (this.tags.length !== other.tags.length) {
            return false;
        }
        // Tags are the same only if the values are in the same order
        if (
            !this.tags.every(function (element, index) {
                return element === other.tags[index];
            })
        ) {
            return false;
        }

        // Compare Date fields
        args = ['startDate', 'scheduledDate', 'dueDate', 'doneDate'];
        for (const el of args) {
            const date1 = this[el] as Moment | null;
            const date2 = other[el] as Moment | null;
            if (Sort.compareByDate(date1, date2) !== 0) {
                return false;
            }
        }

        const recurrence1 = this.recurrence;
        const recurrence2 = other.recurrence;
        if (recurrence1 === null && recurrence2 !== null) {
            return false;
        } else if (recurrence1 !== null && recurrence2 === null) {
            return false;
        } else if (
            recurrence1 &&
            recurrence2 &&
            !recurrence1.identicalTo(recurrence2)
        ) {
            return false;
        }

        return true;
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
                recurrenceDiv.setText(
                    `${recurrenceSymbol} ${this.recurrence.toText()}`,
                );
            }

            if (this.startDate) {
                const startDateDiv = tooltip.createDiv();
                startDateDiv.setText(
                    Task.toTooltipDate({
                        signifier: startDateSymbol,
                        date: this.startDate,
                    }),
                );
            }

            if (this.scheduledDate) {
                const scheduledDateDiv = tooltip.createDiv();
                scheduledDateDiv.setText(
                    Task.toTooltipDate({
                        signifier: scheduledDateSymbol,
                        date: this.scheduledDate,
                    }),
                );
            }

            if (this.dueDate) {
                const dueDateDiv = tooltip.createDiv();
                dueDateDiv.setText(
                    Task.toTooltipDate({
                        signifier: dueDateSymbol,
                        date: this.dueDate,
                    }),
                );
            }

            if (this.doneDate) {
                const doneDateDiv = tooltip.createDiv();
                doneDateDiv.setText(
                    Task.toTooltipDate({
                        signifier: doneDateSymbol,
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

    /**
     * Escape a string so it can be used as part of a RegExp literally.
     * Taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
     */
    private escapeRegExp(s: string) {
        // NOTE: = is not escaped, as doing so gives error:
        //         Invalid regular expression: /(^|\s)hello\=world($|\s)/: Invalid escape
        // NOTE: ! is not escaped, as doing so gives error:
        //         Invalid regular expression: /(^|\s)hello\!world($|\s)/: Invalid escape
        // NOTE: : is not escaped, as doing so gives error:
        //         Invalid regular expression: /(^|\s)hello\:world($|\s)/: Invalid escape
        //
        // Explanation from @AnnaKornfeldSimpson in:
        // https://github.com/esm7/obsidian-tasks/pull/18#issuecomment-1196115407
        // From what I can tell, the three missing characters from the original regex - : ! =
        // are all only considered to have special meanings if they directly follow
        // a ? (all 3) or a ?< (! and =).
        // So theoretically if the ? are all escaped, those three characters do not have to be.
        return s.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1');
    }

    /**
     * Search for the global filter for the purpose of removing it from the description, but do so only
     * if it is a separate word (preceding the beginning of line or a space and followed by the end of line
     * or a space), because we don't want to cut-off nested tags like #task/subtag.
     * If the global filter exists as part of a nested tag, we keep it untouched.
     */
    public getDescriptionWithoutGlobalFilter() {
        const { globalFilter } = getSettings();
        let description = this.description;
        if (globalFilter.length === 0) return description;
        // This matches the global filter (after escaping it) only when it's a complete word
        const globalFilterRegex = RegExp(
            '(^|\\s)' + this.escapeRegExp(globalFilter) + '($|\\s)',
            'ug',
        );
        if (this.description.search(globalFilterRegex) > -1) {
            description = description
                .replace(globalFilterRegex, '$1$2')
                .replace('  ', ' ')
                .trim();
        }
        return description;
    }
}
