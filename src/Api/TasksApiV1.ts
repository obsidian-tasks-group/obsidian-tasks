import type { EditorInsertion } from 'Commands/ToggleDone';
import type { DefaultTaskSerializer } from 'TaskSerializer';
import type { DataviewTaskSerializer } from 'TaskSerializer/DataviewTaskSerializer';

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

    /**
     * Retrieves the Tasks Emoji Format task serializer
     * @returns {DefaultTaskSerializer}
     */
    getDefaultTaskSerializer: () => DefaultTaskSerializer;

    /**
     * Retrieves the Dataview Format task serializer
     * @returns {DataviewTaskSerializer}
     */
    getDataviewTaskSerializer: () => DataviewTaskSerializer;
}
