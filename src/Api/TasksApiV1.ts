import type { EditorInsertion } from 'Commands/ToggleDone';

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
     * Toggles and updates a task line according to a user's preferences, accounting for recurrance
     * rules and completed status.
     *
     * @param line The markdown string of the task line being toggled
     * @param path The path to the file containing line
     * @returns An {@link EditorInsertion} containing the information necessary to replace the toggled line
     */
    toggleLine: (line: string, path: string) => EditorInsertion;
}
