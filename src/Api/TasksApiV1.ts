import type { AbstractRecurrenceClassDefinition } from '../Task/AbstractRecurrence';

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
     * Executes the 'Tasks: Toggle task done' command on the supplied line string
     *
     * @param line The markdown string of the task line being toggled
     * @param path The path to the file containing line
     * @returns The updated line string, which will contain two lines
     *          if a recurring task was completed.
     */
    executeToggleTaskDoneCommand: (line: string, path: string) => string;

    /**
     * Adds a custom recurrence.
     *
     * @param customRecurrence A subclass of AbstractRecurrence, that also implements a static method `fromText`.
     */
    addCustomRecurrence: (customRecurrence: AbstractRecurrenceClassDefinition) => void;
}
