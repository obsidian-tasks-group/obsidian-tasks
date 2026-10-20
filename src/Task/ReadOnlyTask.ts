import type { TasksDate } from '../DateTime/TasksDate';
import type { StatusType } from '../Statuses/StatusConfiguration';
import type { OnCompletion } from './OnCompletion';
import type { Priority } from './Priority';
import type { Task } from './Task';

/**
 * An immutable snapshot of a {@link Status}, for use in {@link ReadOnlyTask}.
 *
 * All properties are primitive values, so the snapshot cannot be used
 * to modify the status objects in the plugin's {@link StatusRegistry}.
 */
export interface ReadOnlyTaskStatus {
    /** The symbol used between the two square brackets in the markdown task. */
    readonly symbol: string;

    /** The name of the status, for display purposes. */
    readonly name: string;

    /** The status type. See {@link StatusType} for details. */
    readonly type: StatusType;

    /** The symbol of the status a task advances to when toggled. */
    readonly nextStatusSymbol: string;
}

/**
 * An immutable, read-only view of a single task, suitable for sharing
 * data about a task outside of the plugin, such as in the Tasks API.
 *
 * Unlike {@link Task}, which is mutable in compiled JavaScript, a
 * `ReadOnlyTask` is frozen at creation time (see {@link Object.freeze}),
 * so code receiving one cannot modify any of Tasks' internal data.
 *
 * Notes on the design:
 *
 * - **Snapshot semantics**: the values are copied from a {@link Task} when
 *   this object is created. A `ReadOnlyTask` is not a live view: edits to
 *   the source {@link Task} or its markdown file are not reflected here.
 * - **Dates**: date fields are {@link TasksDate} objects (never raw
 *   `Moment` objects, and never strings). This gives callers the existing
 *   formatting and comparison facilities, keeps null dates easy to handle,
 *   and leaves room for future support for times and time zones.
 * - **Collections**: array properties such as {@link tags} and
 *   {@link dependsOn} are copies, frozen, and typed as `readonly`, so they
 *   cannot be used to edit the source task's arrays.
 */
export interface ReadOnlyTask {
    // NEW_TASK_FIELD_EDIT_REQUIRED

    // Location
    /** The path of the file containing the task, including the file extension. */
    readonly path: string;

    /** The line number of the task in its file. Zero-based, matching Obsidian's editor and cache positions. */
    readonly lineNumber: number;

    /** Line number where the section containing the task starts. */
    readonly sectionStart: number;

    /** The index of the task within its section. */
    readonly sectionIndex: number;

    /** The closest preceding heading before the task, if any. */
    readonly precedingHeader: string | null;

    // Identity and content
    /** The original line read from the file, before any parsing. */
    readonly originalMarkdown: string;

    /** The task's description, with the task's tags included. */
    readonly description: string;

    /** An immutable snapshot of the task's status. */
    readonly status: ReadOnlyTaskStatus;

    // Dates
    readonly created: TasksDate;
    readonly start: TasksDate;
    readonly scheduled: TasksDate;
    readonly due: TasksDate;
    readonly done: TasksDate;
    readonly cancelled: TasksDate;

    /** Whether the scheduled date was inferred from the file name, rather than read from the task line. */
    readonly scheduledDateIsInferred: boolean;

    // Priority
    readonly priority: Priority;

    // Recurrence and completion behaviour
    /** The task's recurrence rule as text, or an empty string if there is no valid rule. */
    readonly recurrenceRule: string;

    readonly onCompletion: OnCompletion;

    // Dependencies
    readonly id: string;
    readonly dependsOn: readonly string[];

    /** The "^" block link annotation after the dates and recurrence rule, if any. Includes the leading space. */
    readonly blockLink: string;

    // Tags
    readonly tags: readonly string[];
}

/**
 * Create an immutable {@link ReadOnlyTask} snapshot from a {@link Task}.
 *
 * The returned object is frozen with {@link Object.freeze}. All mutable
 * values are copied or snapshotted, so the result never shares mutable
 * state with the source {@link Task}:
 *
 * - Dates are {@link TasksDate} objects wrapping clones of the task's
 *   `Moment` values, so there is no way to edit the task's dates.
 * - Arrays such as tags and dependencies are copied and frozen.
 * - The status is a snapshot of the status's primitive values.
 *
 * @param task - The task to create a read-only snapshot of.
 */
export function taskToReadOnlyTask(task: Task): ReadOnlyTask {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    return Object.freeze({
        path: task.path,
        lineNumber: task.lineNumber,
        sectionStart: task.sectionStart,
        sectionIndex: task.sectionIndex,
        precedingHeader: task.precedingHeader,

        originalMarkdown: task.originalMarkdown,
        description: task.description,

        status: Object.freeze({
            symbol: task.status.symbol,
            name: task.status.name,
            type: task.status.type,
            nextStatusSymbol: task.status.nextStatusSymbol,
        }),

        created: task.created,
        start: task.start,
        scheduled: task.scheduled,
        due: task.due,
        done: task.done,
        cancelled: task.cancelled,
        scheduledDateIsInferred: task.scheduledDateIsInferred,

        priority: task.priority,

        recurrenceRule: task.recurrenceRule,
        onCompletion: task.onCompletion,

        id: task.id,
        dependsOn: Object.freeze([...task.dependsOn]),

        blockLink: task.blockLink,

        tags: Object.freeze([...task.tags]),
    });
}
