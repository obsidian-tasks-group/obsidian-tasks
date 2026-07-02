import type { TasksApiV1 } from './TasksApiV1';

/**
 * Public representation of a Tasks task for API v2.
 *
 * This interface deliberately avoids exposing the internal {@link Task} class.
 */
export interface TaskV1 {
    /** Unique task identifier, or an empty string if the task has no ID. */
    id: string;

    /** Task description, excluding the configured global filter and including tags present in the task line. */
    description: string;

    /** The status symbol inside the task checkbox, such as ' ', 'x', or '/'. */
    status: string;

    /** Priority value, as defined by {@link Priority}. */
    priority: string;

    /** Created date in YYYY-MM-DD format, or null if no created date is set. */
    createdDate: string | null;

    /** Start date in YYYY-MM-DD format, or null if no start date is set. */
    startDate: string | null;

    /** Scheduled date in YYYY-MM-DD format, or null if no scheduled date is set. */
    scheduledDate: string | null;

    /** Due date in YYYY-MM-DD format, or null if no due date is set. */
    dueDate: string | null;

    /** Done date in YYYY-MM-DD format, or null if no done date is set. */
    doneDate: string | null;

    /** Cancelled date in YYYY-MM-DD format, or null if no cancelled date is set. */
    cancelledDate: string | null;

    /** Recurrence rule text, or an empty string if no recurrence is set. */
    recurrenceRule: string;

    /** On Completion action, or an empty string if no action is set. */
    onCompletion: string;

    /** IDs of tasks that this task depends on. */
    dependsOn: string[];

    /** Tags extracted from the task description. */
    tags: string[];

    /** Block link suffix, including the leading space, or an empty string if none is set. */
    blockLink: string;

    /** Full original Markdown line for this task. */
    originalMarkdown: string;

    /** Vault-relative path to the Markdown file containing this task. */
    path: string;

    /** Zero-based line number of the task in its file. */
    lineNumber: number;
}

/**
 * Destination for creating a task through API v2.
 */
export interface TaskCreationDestinationV1 {
    /** Vault-relative path to the Markdown file where the task should be created. */
    path: string;

    /** Zero-based line number used with {@link placement}. */
    line?: number;

    /**
     * Placement relative to {@link line}.
     *
     * If line is supplied and placement is omitted, the task is inserted after the line.
     * If neither line nor placement is supplied, Tasks appends after the last existing task line
     * in the file, or at end of file if the file contains no task lines.
     */
    placement?: 'before' | 'after' | 'replace' | 'append';
}

/**
 * Tasks API v2 interface.
 *
 * API v2 includes all API v1 methods and adds versioned task objects, task search,
 * vault-writing task creation and editing, and task ID generation.
 */
export interface TasksApiV2 extends TasksApiV1 {
    /**
     * Runs a Tasks query against the current task cache.
     * Query strings use the same syntax as Tasks code blocks.
     *
     * @see docs/Queries/About Queries.md
     * @see docs/Queries/Filters.md
     * @see docs/Queries/Combining Filters.md
     * @see docs/Queries/Regular Expressions.md
     *
     * @example
     * ```ts
     * const dueSoon = tasksApi.queryTasks('not done\ndue before tomorrow');
     * ```
     *
     * @example
     * ```ts
     * const projectTasks = tasksApi.queryTasks('not done\n(description includes #project) OR (path includes Work/)');
     * ```
     *
     * @example
     * ```ts
     * const waitingTasks = tasksApi.queryTasks('description regex matches /waiting|blocked/i');
     * ```
     *
     * @param query The Tasks query instructions to run
     * @returns Matching tasks as public {@link TaskV1} objects
     */
    queryTasks(query: string): TaskV1[];

    /**
     * Creates a task in an existing Markdown file.
     *
     * @param destination The file and optional line placement for the new task
     * @param description The task description to use unless overridden by taskData.description
     * @param taskData Optional task fields that override creation defaults
     * @returns A promise that contains the created task as a public {@link TaskV1} object
     */
    createTask(
        destination: TaskCreationDestinationV1,
        description: string,
        taskData?: Partial<TaskV1>,
    ): Promise<TaskV1>;

    /**
     * Edits the task with the supplied task ID.
     *
     * @param taskId The non-empty task ID to edit
     * @param taskData Task fields to apply to the existing task
     * @returns A promise that contains the edited task as a public {@link TaskV1} object
     */
    editTask(taskId: string, taskData: Partial<TaskV1>): Promise<TaskV1>;

    /**
     * Ensures that a public task object has a unique ID.
     *
     * @param task The task to inspect
     * @returns The same task object if it already has an ID, otherwise a copy with a generated unique ID
     */
    ensureTaskHasUniqueId(task: TaskV1): TaskV1;
}
