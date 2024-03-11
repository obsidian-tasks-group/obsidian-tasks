import type { Task } from '../Task/Task';
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
     * @param task - task to toggle
     *
     * @returns {Promise<Task[]>} A promise that contains the Markdown string for the task entered
     */
    toggleTask(task: Task): Promise<Task[]>;
    /**
     * @param task - task to toggle.
     *
     * @returns {Promise<Task[]>} A promise that contains the Markdown string for the task entered
     */
    mapObjToTasks(objTasks: Task[]): Task[];
}
