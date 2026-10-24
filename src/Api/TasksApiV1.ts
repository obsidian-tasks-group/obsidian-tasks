import type { ReadOnlyTask } from '../Task/ReadOnlyTask';

/**
 * Tasks API v1 interface
 */
export interface TasksApiV1 {
    /**
     * Opens the Tasks UI and returns the Markdown string for the task entered.
     *
     * @returns {Promise<string>} A promise that contains the Markdown string for the task entered or
     * an empty string, if data entry was cancelled.
     */
    createTaskLineModal(): Promise<string>;

    /**
     * Opens the Tasks UI pre-filled with the provided task line for editing.
     * Does not edit the task line in the file, but returns the edited task line as a Markdown string.
     *
     * @param taskLine The markdown string of the task line to edit
     * @returns {Promise<string>} A promise that contains the Markdown string for the edited task or
     * an empty string in the case where the data entry was cancelled.
     */
    editTaskLineModal(taskLine: string): Promise<string>;

    /**
     * Executes the 'Tasks: Toggle task done' command on the supplied line string
     *
     * @param line The markdown string of the task line being toggled
     * @param path The path to the file containing line
     * @returns The updated line string, which will contain two lines
     *          if a recurring task was completed.
     */
    executeToggleTaskDoneCommand: (line: string, path: string) => string;

    /**
     * Executes a Tasks query against the vault's tasks cache synchronously.
     *
     * Evaluates `querySource` against cached tasks, honouring user settings (Global Query,
     * Global Filter, and Presets).
     *
     * When the query produces groups, tasks are returned in group-major order (matching
     * rendered results) and deduplicated.
     *
     * @param querySource The Tasks query string (e.g. "not done\ndue before tomorrow").
     * @param queryPath Optional vault path of the file containing the query, used to resolve Placeholders (e.g. {{query.file.folder}}) and file properties.
     * @returns Array of unique matching tasks as frozen ReadOnlyTask objects.
     * @throws Error if `querySource` is not a string, if `queryPath` is not a string (when provided), if the query syntax is invalid, or if placeholders cannot be resolved.
     */
    queryTasks: (querySource: string, queryPath?: string) => ReadOnlyTask[];
}
