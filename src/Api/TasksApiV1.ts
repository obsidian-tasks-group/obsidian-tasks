/**
 * Tasks API v1 interface
 */
export interface TasksApiV1 {
    /**
     * Opens the Tasks UI and returns the Markdown string for the task entered.
     * If the optional Markdown string for a task is passed, the form will be
     * populated with that task's properties.
     *
     * @param taskLine - Optional Markdown string of the task to edit.
     *
     * @returns {Promise<string>} A promise that contains the Markdown string for the task or
     * an empty string, if data entry was cancelled.
     */
    createOrEditTaskLineModal(taskLine?: string): Promise<string>;
}
