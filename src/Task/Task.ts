import type { Moment } from 'moment';
import { getSettings, getUserSelectedTaskFormat } from '../Config/Settings';
import { GlobalFilter } from '../Config/GlobalFilter';
import { StatusRegistry } from '../Statuses/StatusRegistry';
import type { Status } from '../Statuses/Status';
import { compareByDate } from '../lib/DateTools';
import { TasksDate } from '../Scripting/TasksDate';
import { StatusType } from '../Statuses/StatusConfiguration';
import type { TasksFile } from '../Scripting/TasksFile';
import { PriorityTools } from '../lib/PriorityTools';
import { logging } from '../lib/logging';
import { logEndOfTaskEdit, logStartOfTaskEdit } from '../lib/LogTasksHelper';
import { DateFallback } from './DateFallback';
import { ListItem } from './ListItem';
import { Urgency } from './Urgency';
import type { Recurrence } from './Recurrence';
import type { TaskLocation } from './TaskLocation';
import type { Priority } from './Priority';
import { TaskRegularExpressions } from './TaskRegularExpressions';

/**
 * Storage for the task line, broken down in to sections.
 * See {@link Task.extractTaskComponents} for use.
 */
interface TaskComponents {
    indentation: string;
    listMarker: string;
    status: Status;
    body: string;
    blockLink: string;
}

/**
 * Task encapsulates the properties of the MarkDown task along with
 * the extensions provided by this plugin. This is used to parse and
 * generate the markdown task for all updates and replacements.
 *
 * @export
 * @class Task
 */
export class Task extends ListItem {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    public readonly status: Status;
    public readonly description: string;
    public readonly indentation: string;
    public readonly listMarker: string;

    public readonly taskLocation: TaskLocation;

    public readonly tags: string[];

    public readonly priority: Priority;

    public readonly createdDate: Moment | null;
    public readonly startDate: Moment | null;
    public readonly scheduledDate: Moment | null;
    public readonly dueDate: Moment | null;
    public readonly doneDate: Moment | null;
    public readonly cancelledDate: Moment | null;

    public readonly recurrence: Recurrence | null;

    public readonly dependsOn: string[];
    public readonly id: string;

    /** The blockLink is a "^" annotation after the dates/recurrence rules.
     * Any non-empty value must begin with ' ^'. */
    public readonly blockLink: string;

    public readonly scheduledDateIsInferred: boolean;

    private _urgency: number | null = null;

    constructor({
        // NEW_TASK_FIELD_EDIT_REQUIRED
        status,
        description,
        taskLocation,
        indentation,
        listMarker,
        priority,
        createdDate,
        startDate,
        scheduledDate,
        dueDate,
        doneDate,
        cancelledDate,
        recurrence,
        dependsOn,
        id,
        blockLink,
        tags,
        originalMarkdown,
        scheduledDateIsInferred,
        parent = null,
    }: {
        // NEW_TASK_FIELD_EDIT_REQUIRED
        status: Status;
        description: string;
        taskLocation: TaskLocation;
        indentation: string;
        listMarker: string;
        priority: Priority;
        createdDate: moment.Moment | null;
        startDate: moment.Moment | null;
        scheduledDate: moment.Moment | null;
        dueDate: moment.Moment | null;
        doneDate: moment.Moment | null;
        cancelledDate: moment.Moment | null;
        recurrence: Recurrence | null;
        dependsOn: string[] | [];
        id: string;
        blockLink: string;
        tags: string[] | [];
        originalMarkdown: string;
        scheduledDateIsInferred: boolean;
        parent?: ListItem | null;
    }) {
        super(originalMarkdown, parent);
        // NEW_TASK_FIELD_EDIT_REQUIRED
        this.status = status;
        this.description = description;
        this.indentation = indentation;
        this.listMarker = listMarker;
        this.taskLocation = taskLocation;

        this.tags = tags;

        this.priority = priority;

        this.createdDate = createdDate;
        this.startDate = startDate;
        this.scheduledDate = scheduledDate;
        this.dueDate = dueDate;
        this.doneDate = doneDate;
        this.cancelledDate = cancelledDate;

        this.recurrence = recurrence;

        this.dependsOn = dependsOn;
        this.id = id;

        this.blockLink = blockLink;

        this.scheduledDateIsInferred = scheduledDateIsInferred;
    }

    /**
     * Takes the given line from an Obsidian note and returns a Task object.
     * Will check if Global Filter is present in the line.
     *
     * If you want to specify a parent ListItem or Task after a fromLine call,
     * you have to do the following:
     * @example
     *  const finalTask = new Task({ ...firstReadTask!, parent: parentListItem });
     *
     * @static
     * @param {string} line - The full line in the note to parse.
     * @param {TaskLocation} taskLocation - The location of the task line
     * @param {(Moment | null)} fallbackDate - The date to use as the scheduled date if no other date is set
     * @return {*}  {(Task | null)}
     * @memberof Task
     * @see parseTaskSignifiers
     */
    public static fromLine({
        line,
        taskLocation,
        fallbackDate,
    }: {
        line: string;
        taskLocation: TaskLocation;
        fallbackDate: Moment | null;
    }): Task | null {
        const taskComponents = Task.extractTaskComponents(line);
        // Check the line to see if it is a markdown task.
        if (taskComponents === null) {
            return null;
        }

        // return if the line does not have the global filter. Do this before
        // any other processing to improve performance.
        if (!GlobalFilter.getInstance().includedIn(taskComponents.body)) {
            return null;
        }

        return Task.parseTaskSignifiers(line, taskLocation, fallbackDate);
    }

    /**
     * Parses the line in attempt to get the task details.
     *
     * This reads the task even if the Global Filter is missing.
     * If a Global Filter check is needed, use {@link Task.fromLine}.
     *
     * Task is returned regardless if Global Filter is present or not.
     * However, if it is, it will be removed from the tags.
     *
     * @param line - the full line to parse
     * @param taskLocation - The location of the task line
     * @param fallbackDate - The date to use as the scheduled date if no other date is set
     * @returns {*} {(Task | null)}
     * @see fromLine
     */
    public static parseTaskSignifiers(
        line: string,
        taskLocation: TaskLocation,
        fallbackDate: Moment | null,
    ): Task | null {
        const taskComponents = Task.extractTaskComponents(line);
        // Check the line to see if it is a markdown task.
        if (taskComponents === null) {
            return null;
        }

        const { taskSerializer } = getUserSelectedTaskFormat();
        const taskInfo = taskSerializer.deserialize(taskComponents.body);

        let scheduledDateIsInferred = false;
        // Infer the scheduled date from the file name if not set explicitly
        if (DateFallback.canApplyFallback(taskInfo) && fallbackDate !== null) {
            taskInfo.scheduledDate = fallbackDate;
            scheduledDateIsInferred = true;
        }

        // Ensure that whitespace is removed around tags
        taskInfo.tags = taskInfo.tags.map((tag) => tag.trim());

        // Remove the Global Filter if it is there
        taskInfo.tags = taskInfo.tags.filter((tag) => !GlobalFilter.getInstance().equals(tag));

        return new Task({
            ...taskComponents,
            ...taskInfo,
            taskLocation: taskLocation,
            originalMarkdown: line,
            scheduledDateIsInferred,
        });
    }

    /**
     * Extract the component parts of the task line.
     * @param line
     * @returns a {@link TaskComponents} object containing the component parts of the task line
     */
    static extractTaskComponents(line: string): TaskComponents | null {
        // Check the line to see if it is a markdown task.
        const regexMatch = line.match(TaskRegularExpressions.taskRegex);
        if (regexMatch === null) {
            return null;
        }

        const indentation = regexMatch[1];
        const listMarker = regexMatch[2];

        // Get the status of the task.
        const statusString = regexMatch[3];
        const status = StatusRegistry.getInstance().bySymbolOrCreate(statusString);

        // match[4] includes the whole body of the task after the brackets.
        let body = regexMatch[4].trim();

        // Match for block link and remove if found. Always expected to be
        // at the end of the line.
        const blockLinkMatch = body.match(TaskRegularExpressions.blockLinkRegex);
        const blockLink = blockLinkMatch !== null ? blockLinkMatch[0] : '';

        if (blockLink !== '') {
            body = body.replace(TaskRegularExpressions.blockLinkRegex, '').trim();
        }
        return { indentation, listMarker, status, body, blockLink };
    }
    /**
     * Flatten the task as a string that includes all its components.
     *
     * @note Output depends on {@link Settings.taskFormat}
     * @return {*}  {string}
     * @memberof Task
     */
    public toString(): string {
        return getUserSelectedTaskFormat().taskSerializer.serialize(this);
    }

    /**
     * Returns the Task as a list item with a checkbox.
     *
     * @note Output depends on {@link Settings.taskFormat}
     * @return {*}  {string}
     * @memberof Task
     */
    public toFileLineString(): string {
        return `${this.indentation}${this.listMarker} [${this.status.symbol}] ${this.toString()}`;
    }

    /**
     * Toggles this task and returns the resulting task(s).
     *
     * Use this method if you need to know which is the original (completed)
     * task and which is the new recurrence.
     *
     * If the task is not recurring, it will return `[toggled]`.
     *
     * Toggling can result in more than one returned task in the case of
     * recurrence. In this case, the toggled task will be returned
     * together with the next occurrence in the order `[next, toggled]`.
     *
     * There is a possibility to use user set order `[next, toggled]`
     * or `[toggled, next]` - {@link toggleWithRecurrenceInUsersOrder}.
     *
     */
    public toggle(): Task[] {
        const logger = logging.getLogger('tasks.Task');
        const codeLocation = 'toggle()';
        logStartOfTaskEdit(logger, codeLocation, this);

        const newStatus = StatusRegistry.getInstance().getNextStatusOrCreate(this.status);

        const newTasks = this.handleNewStatus(newStatus);
        logEndOfTaskEdit(logger, codeLocation, newTasks);
        return newTasks;
    }

    /**
     * Edits the {@link status} of this task and returns the resulting task(s).
     *
     * Use this method if you need to know which is the original (edited)
     * task and which is the new recurrence, if any.
     *
     * If the task is not recurring, it will return `[edited]`,
     * or `[this]` if the status is unchanged.
     *
     * Editing the status can result in more than one returned task in the case of
     * recurrence. In this case, the edited task will be returned
     * together with the next occurrence in the order `[next, edited]`.
     *
     * There is a possibility to use user set order `[next, edited]`
     * or `[toggled, next]` - {@link handleNewStatusWithRecurrenceInUsersOrder}.
     *
     * @param newStatus
     * @param today - Optional date representing the completion date. This defaults to today.
     *                It is used for any new done date, and for the calculation of new
     *                dates on recurring tasks that are marked as 'when done'.
     *                However, any created date on a new recurrence is, for now, calculated from the
     *                actual current date, rather than this parameter.
     */
    public handleNewStatus(newStatus: Status, today = window.moment()): Task[] {
        if (newStatus.identicalTo(this.status)) {
            // There is no need to create a new Task object if the new status behaviour is identical to the current one.
            return [this];
        }

        const { setDoneDate } = getSettings();
        const newDoneDate = this.newDate(newStatus, StatusType.DONE, this.doneDate, setDoneDate, today);

        const { setCancelledDate } = getSettings();
        const newCancelledDate = this.newDate(
            newStatus,
            StatusType.CANCELLED,
            this.cancelledDate,
            setCancelledDate,
            today,
        );

        let nextOccurrence: {
            startDate: Moment | null;
            scheduledDate: Moment | null;
            dueDate: Moment | null;
        } | null = null;
        if (newStatus.isCompleted()) {
            if (!this.status.isCompleted() && this.recurrence !== null) {
                nextOccurrence = this.recurrence.next(today);
            }
        }

        const toggledTask = new Task({
            ...this,
            status: newStatus,
            doneDate: newDoneDate,
            cancelledDate: newCancelledDate,
        });

        const newTasks: Task[] = [];

        if (nextOccurrence !== null) {
            const nextTask = this.createNextOccurrence(newStatus, nextOccurrence);
            newTasks.push(nextTask);
        }

        // Write next occurrence before previous occurrence.
        newTasks.push(toggledTask);

        return newTasks;
    }

    /**
     * Returns the new value to use for a date that tracks progress on tasks upon transition to a different
     * {@link StatusType}.
     *
     * Currently, this is used to calculate the new Done Date or Cancelled Date,
     */
    private newDate(
        newStatus: Status,
        statusType: StatusType,
        oldDate: moment.Moment | null,
        dateEnabledInSettings: boolean,
        today: moment.Moment,
    ) {
        let newDate = null;
        if (newStatus.type === statusType) {
            if (this.status.type !== statusType) {
                // Set date only if setting value is true.
                if (dateEnabledInSettings) {
                    newDate = today;
                }
            } else {
                // This task was already in statusType, so preserve its existing date.
                newDate = oldDate;
            }
        }
        return newDate;
    }

    private createNextOccurrence(
        newStatus: Status,
        nextOccurrence: {
            startDate: moment.Moment | null;
            scheduledDate: moment.Moment | null;
            dueDate: moment.Moment | null;
        },
    ) {
        const { setCreatedDate } = getSettings();
        let createdDate: moment.Moment | null = null;
        if (setCreatedDate) {
            createdDate = window.moment();
        }
        // In case the task being toggled was previously cancelled, ensure the new task has no cancelled date:
        const cancelledDate = null;

        // Also set the new done date to zero, to simplify the
        // saving of edited tasks in the Edit Task modal:
        const doneDate = null;

        const statusRegistry = StatusRegistry.getInstance();
        const nextStatus = statusRegistry.getNextRecurrenceStatusOrCreate(newStatus);
        return new Task({
            ...this,
            ...nextOccurrence,
            status: nextStatus,
            // New occurrences cannot have the same block link.
            // And random block links don't help.
            blockLink: '',

            // New occurrences also cannot have the same dependency fields. See #2654.
            id: '',
            dependsOn: [],

            // add new createdDate on recurring tasks
            createdDate,
            cancelledDate,
            doneDate,
        });
    }

    /**
     * Toggles this task and returns the resulting task(s).
     *
     * Use this method if the updated task(s) are to be saved,
     * as this honours the user setting to control the order
     * the tasks should be saved in.
     *
     * If the task is not recurring, it will return `[toggled]`.
     *
     * Toggling can result in more than one returned task in the case of
     * recurrence. In this case, the toggled task will be returned in
     * user set order `[next, toggled]` or `[toggled, next]` depending
     * on {@link Settings}.
     *
     * If there is no need to consider user settings call {@link toggle}.
     *
     */
    public toggleWithRecurrenceInUsersOrder(): Task[] {
        const newTasks = this.toggle();
        return this.putRecurrenceInUsersOrder(newTasks);
    }

    public handleNewStatusWithRecurrenceInUsersOrder(newStatus: Status, today = window.moment()): Task[] {
        const logger = logging.getLogger('tasks.Task');
        logger.debug(
            `changed task ${this.taskLocation.path} ${this.taskLocation.lineNumber} ${this.originalMarkdown} status to '${newStatus.symbol}'`,
        );

        const newTasks = this.handleNewStatus(newStatus, today);
        return this.putRecurrenceInUsersOrder(newTasks);
    }

    private putRecurrenceInUsersOrder(newTasks: Task[]) {
        const { recurrenceOnNextLine } = getSettings();
        return recurrenceOnNextLine ? newTasks.reverse() : newTasks;
    }

    /**
     * Return whether the task is considered done.
     * @returns true if the status type is {@link StatusType.DONE}, {@link StatusType.CANCELLED} or {@link StatusType.NON_TASK}, and false otherwise.
     */
    public get isDone(): boolean {
        return (
            this.status.type === StatusType.DONE ||
            this.status.type === StatusType.CANCELLED ||
            this.status.type === StatusType.NON_TASK
        );
    }

    /**
     * A task is treated as blocked if it depends on any existing task ids on tasks that are TODO or IN_PROGRESS.
     *
     * 'Done' tasks (with status DONE, CANCELLED or NON_TASK) are never blocked.
     * Only direct dependencies are considered.
     * @param allTasks - all the tasks in the vault. In custom queries, this is available via query.allTasks.
     */
    public isBlocked(allTasks: Readonly<Task[]>) {
        if (this.dependsOn.length === 0) {
            return false;
        }

        if (this.isDone) {
            return false;
        }

        for (const depId of this.dependsOn) {
            const depTask = allTasks.find((task) => task.id === depId && !task.isDone);
            if (!depTask) {
                // There is no not-done task with this id.
                continue;
            }

            // We found a not-done task that this depends on, meaning this one is blocked:
            return true;
        }

        return false;
    }

    /**
     * A Task is blocking if there is any other not-done task dependsOn value with its id.
     *
     * 'Done' tasks (with status DONE, CANCELLED or NON_TASK) are never blocking.
     * Only direct dependencies are considered.
     * @param allTasks - all the tasks in the vault. In custom queries, this is available via query.allTasks.
     */
    public isBlocking(allTasks: Readonly<Task[]>) {
        if (this.id === '') {
            return false;
        }

        if (this.isDone) {
            return false;
        }

        return allTasks.some((task) => {
            if (task.isDone) {
                return false;
            }

            return task.dependsOn.includes(this.id);
        });
    }

    /**
     * Return the number of the Task's priority.
     *     - Highest = 0
     *     - High = 1
     *     - Medium = 2
     *     - None = 3
     *     - Low = 4
     *     - Lowest = 5
     * @see priorityName
     */
    public get priorityNumber(): number {
        return Number.parseInt(this.priority);
    }

    /**
     * Returns the text to be used to represent the {@link priority} in group headings.
     *
     * Hidden text is used to sort the priorities in decreasing order, from
     * {@link Priority.Highest} to {@link Priority.Lowest}.
     */
    public get priorityNameGroupText(): string {
        const priorityName = PriorityTools.priorityNameUsingNormal(this.priority);
        // Text inside the %%..%% comments is used to control the sort order.
        // The comments are hidden by Obsidian when the headings are rendered.
        return `%%${this.priority}%%${priorityName} priority`;
    }

    /**
     * Return a copy of the description, with any tags removed.
     *
     * Note that this removes tags recognised by Tasks (including removing #123, for example),
     * as opposed to tags recognised by Obsidian, which does not treat numbers-only as valid tags.
     */
    public get descriptionWithoutTags(): string {
        return this.description.replace(TaskRegularExpressions.hashTags, '').trim();
    }

    /**
     * Return the name of the Task's priority.
     *
     * Note that the default priority is called 'Normal', not 'None'.
     @see priorityNumber
     */
    public get priorityName(): string {
        return PriorityTools.priorityNameUsingNormal(this.priority);
    }

    public get urgency(): number {
        if (this._urgency === null) {
            this._urgency = Urgency.calculate(this);
        }

        return this._urgency;
    }

    public get path(): string {
        return this.taskLocation.path;
    }

    /**
     * Return {@link cancelledDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    public get cancelled(): TasksDate {
        return new TasksDate(this.cancelledDate);
    }

    /**
     * Return {@link createdDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    public get created(): TasksDate {
        return new TasksDate(this.createdDate);
    }

    /**
     * Return {@link doneDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    public get done(): TasksDate {
        return new TasksDate(this.doneDate);
    }

    /**
     * Return {@link dueDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    public get due(): TasksDate {
        return new TasksDate(this.dueDate);
    }

    /**
     * Return {@link scheduledDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    public get scheduled(): TasksDate {
        return new TasksDate(this.scheduledDate);
    }

    /**
     * Return {@link startDate} as a {@link TasksDate}, so the field names in scripting docs are consistent with the existing search instruction names, and null values are easy to deal with.
     */
    public get start(): TasksDate {
        return new TasksDate(this.startDate);
    }

    /**
     * Return the date fields that contribute to 'happens' searches.
     *
     * @see happens
     * @see {@link HappensDateField}
     */
    public get happensDates(): (Moment | null)[] {
        return Array.of(this.startDate, this.scheduledDate, this.dueDate);
    }

    /**
     * Return the earliest of the dates used by 'happens' in this given task as a {@link TasksDate}.
     *
     * Generally speaking, the earliest date is considered to be the highest priority,
     * as it is the first point at which the user might wish to act on the task.
     *
     * Invalid dates are ignored.
     *
     * @see happensDates
     * @see {@link HappensDateField}
     */
    public get happens(): TasksDate {
        const happensDates = this.happensDates;
        // Array.from() creates a copy of the array, to stop SonarLint
        // complaining about sort() mutating the original.
        // The preferred solution would to use toSorted(), but that is not currently available
        // in the project configuration, without changing the compiler options, which seems
        // a step too far in the middle of a bug-fix branch.
        // https://stackoverflow.com/questions/76593892/how-to-use-tosorted-method-in-typescript
        const sortedHappensDates = Array.from(happensDates).sort(compareByDate);

        // Return the first non-null, valid date:
        for (const date of sortedHappensDates) {
            if (date?.isValid()) {
                return new TasksDate(date);
            }
        }
        return new TasksDate(null);
    }

    /**
     * Return true if the Task has a valid recurrence rule, and false otherwise,
     * that is, false if it does not have a recurrence rule, or the recurrence rule is invalid.
     */
    public get isRecurring(): boolean {
        return this.recurrence !== null;
    }

    /**
     * Return the text of the Task's recurrence rule, if it is supplied and is valid,
     * and an empty string otherwise.
     */
    public get recurrenceRule(): string {
        return this.recurrence ? this.recurrence.toText() : '';
    }

    public get heading(): string | null {
        return this.precedingHeader;
    }

    public get hasHeading(): boolean {
        return this.precedingHeader !== null;
    }

    public get file(): TasksFile {
        return this.taskLocation.tasksFile;
    }

    /**
     * Return the name of the file containing the task, with the .md extension removed.
     */
    public get filename(): string | null {
        const fileNameMatch = this.path.match(/([^/]+)\.md$/);
        if (fileNameMatch !== null) {
            return fileNameMatch[1];
        } else {
            return null;
        }
    }

    get lineNumber(): number {
        return this.taskLocation.lineNumber;
    }

    get sectionStart(): number {
        return this.taskLocation.sectionStart;
    }

    get sectionIndex(): number {
        return this.taskLocation.sectionIndex;
    }

    public get precedingHeader(): string | null {
        return this.taskLocation.precedingHeader;
    }

    /**
     * Returns the text that should be displayed to the user when linking to the origin of the task
     *
     * @param isFilenameUnique {boolean|null} Whether the name of the file that contains the task is unique in the vault.
     *                                        If it is undefined, the outcome will be the same as with a unique file name: the file name only.
     *                                        If set to `true`, the full path will be returned.
     */
    public getLinkText({ isFilenameUnique }: { isFilenameUnique: boolean | undefined }): string | null {
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
        if (this.precedingHeader !== null && this.precedingHeader !== linkText) {
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
        return oldTasks.every((oldTask, index) => oldTask.identicalTo(newTasks[index]));
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
        // NEW_TASK_FIELD_EDIT_REQUIRED

        // Based on ideas from koala. AquaCat and javalent in Discord:
        // https://discord.com/channels/686053708261228577/840286264964022302/996735200388186182
        // and later.
        //
        // Note: sectionStart changes every time a line is added or deleted before
        //       any of the tasks in a file. This does mean that redrawing of tasks blocks
        //       happens more often than is ideal.
        let args: Array<keyof Task> = [
            'description',
            'path',
            'indentation',
            'listMarker',
            'lineNumber',
            'sectionStart',
            'sectionIndex',
            'precedingHeader',
            'priority',
            'blockLink',
            'scheduledDateIsInferred',
            'id',
            'dependsOn',
        ];
        for (const el of args) {
            if (this[el]?.toString() !== other[el]?.toString()) return false;
        }

        if (!this.status.identicalTo(other.status)) {
            return false;
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
        args = Task.allDateFields();
        for (const el of args) {
            const date1 = this[el] as Moment | null;
            const date2 = other[el] as Moment | null;
            if (compareByDate(date1, date2) !== 0) {
                return false;
            }
        }

        const recurrence1 = this.recurrence;
        const recurrence2 = other.recurrence;
        if (recurrence1 === null && recurrence2 !== null) {
            return false;
        } else if (recurrence1 !== null && recurrence2 === null) {
            return false;
        } else if (recurrence1 && recurrence2 && !recurrence1.identicalTo(recurrence2)) {
            return false;
        }

        return true;
    }

    public static allDateFields(): (keyof Task)[] {
        return [
            'createdDate' as keyof Task,
            'startDate' as keyof Task,
            'scheduledDate' as keyof Task,
            'dueDate' as keyof Task,
            'doneDate' as keyof Task,
            'cancelledDate' as keyof Task,
        ];
    }

    /**
     * Returns an array of hashtags found in string
     *
     * @param description A task description that may contain hashtags
     *
     * @returns An array of hashTags found in the string
     */
    public static extractHashtags(description: string): string[] {
        return description.match(TaskRegularExpressions.hashTags)?.map((tag) => tag.trim()) ?? [];
    }
}

/**
 * A task is treated as blocked if it depends on any existing task ids on tasks that are TODO or IN_PROGRESS.
 *
 * 'Done' tasks (with status DONE, CANCELLED or NON_TASK) are never blocked.
 * @param thisTask
 * @param allTasks
 */
export function isBlocked(thisTask: Task, allTasks: Task[]) {
    if (thisTask.dependsOn.length === 0) {
        return false;
    }

    if (thisTask.isDone) {
        return false;
    }

    for (const depId of thisTask.dependsOn) {
        const depTask = allTasks.find((task) => task.id === depId && !task.isDone);
        if (!depTask) {
            // There is no not-done task with this id.
            continue;
        }

        // We found a not-done task that this depends on, meaning this one is blocked:
        return true;
    }

    return false;
}
