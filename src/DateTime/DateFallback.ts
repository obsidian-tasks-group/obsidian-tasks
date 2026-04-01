import type { Moment } from 'moment';
import { getSettings } from '../Config/Settings';
import type { TaskLocation } from '../Task/TaskLocation';

type TaskWithDateFallbackFields = {
    startDate: Moment | null;
    scheduledDate: Moment | null;
    dueDate: Moment | null;
    scheduledDateIsInferred: boolean;
    [key: string]: any;
};

/**
 * Implement date from path detection
 */
export class DateFallback {
    private static createTask<TTask>(args: any): TTask {
        // Lazy-load Task to avoid the runtime Task <-> DateFallback circular dependency.
        const { Task } = require('../Task/Task');
        return new Task(args) as TTask;
    }

    /**
     * Attempt to parse the filename to extract a date taking user settings into account. If date inference is not
     * enabled parsing is bypassed and null is returned.
     * @param path the full path of the file
     * @return a Moment or null if no date was found.
     */
    public static fromPath(path: string): Moment | null {
        const { useFilenameAsScheduledDate, filenameAsDateFolders } = getSettings();

        if (!useFilenameAsScheduledDate) {
            // feature is disabled
            return null;
        }

        if (!this.matchesAnyFolder(filenameAsDateFolders, path)) {
            // file is not in any folder or subfolder that was selected for date inference
            return null;
        }

        return this.extractDateFromPath(path);
    }

    private static matchesAnyFolder(folders: string[], path: string) {
        if (folders.length === 0) {
            // no constraints on matching folders
            return true;
        }

        // folders never end with a '/', and paths contain at least on slash (separating the folder from the
        // filename)
        return folders.some((folder) => path.startsWith(folder + '/'));
    }

    private static extractDateFromPath(path: string): Moment | null {
        const firstPos = Math.max(0, path.lastIndexOf('/') + 1);
        const lastPos = path.lastIndexOf('.');

        const basename = path.substring(firstPos, lastPos);

        const { filenameAsScheduledDateFormat } = getSettings();
        if (filenameAsScheduledDateFormat !== '') {
            const date = window.moment(basename, filenameAsScheduledDateFormat, true);
            if (date.isValid()) {
                return date;
            }
        }

        let dateMatch = /(\d{4})-(\d{2})-(\d{2})/.exec(basename);
        if (!dateMatch) dateMatch = /(\d{4})(\d{2})(\d{2})/.exec(basename);

        if (dateMatch) {
            const date = window.moment([parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3])]);
            if (date.isValid()) {
                return date;
            }
        }

        return null;
    }

    /**
     * Return true iff a fallback can be set
     **/
    public static canApplyFallback({
        startDate,
        scheduledDate,
        dueDate,
    }: {
        startDate: Moment | null;
        scheduledDate: Moment | null;
        dueDate: Moment | null;
    }): boolean {
        return startDate === null && dueDate === null && scheduledDate === null;
    }

    /**
     * Implement the logic to update the fields related to date fallback of a task when its file has moved
     * @param task         - task to update
     * @param newLocation  - new location
     * @param fallbackDate - fallback date from new location, for efficiency. Can be null
     */
    public static updateTaskPath<TTask extends TaskWithDateFallbackFields>(
        task: TTask,
        newLocation: TaskLocation,
        fallbackDate: Moment | null,
    ): TTask {
        // initialize with values from before the path was changed
        let scheduledDate = task.scheduledDate;
        let scheduledDateIsInferred = task.scheduledDateIsInferred;

        if (fallbackDate === null) {
            // The new path doesn't contain a date...

            if (scheduledDateIsInferred) {
                // ...but the previous path had one : remove inferred date from Task
                scheduledDateIsInferred = false;
                scheduledDate = null;
            } else {
                // ...and the old path didn't contain any either :
                // do nothing, and keep any explicitly set scheduled date
            }
        } else {
            // The new path contains a date...

            if (scheduledDateIsInferred) {
                // ...and we used the fallback date from the previous path :
                // set the scheduled date from the new path
                scheduledDate = fallbackDate;
            } else if (this.canApplyFallback(task)) {
                // ...and the task is candidate to date fallback
                // set the scheduled date from the new path
                scheduledDate = fallbackDate;
                scheduledDateIsInferred = true;
            } else {
                // preserve existing dates, including explicit scheduledDate
            }
        }

        return DateFallback.createTask<TTask>({
            ...task,
            taskLocation: newLocation,
            scheduledDate,
            scheduledDateIsInferred,
        });
    }

    /**
     * Update an array of updated tasks to remove the inferred scheduled date status if the scheduled date has been
     * modified as compared to the original date
     */
    public static removeInferredStatusIfNeeded<TTask extends TaskWithDateFallbackFields>(
        originalTask: TTask,
        updatedTasks: TTask[],
    ): TTask[] {
        const inferredScheduledDate = originalTask.scheduledDateIsInferred ? originalTask.scheduledDate : null;

        return updatedTasks.map((task: TTask) => {
            if (inferredScheduledDate !== null && !inferredScheduledDate.isSame(task.scheduledDate, 'day')) {
                // if a fallback date was used before modification, and the scheduled date was modified, we have to mark
                // the scheduled date as not inferred anymore.
                task = DateFallback.createTask<TTask>({ ...task, scheduledDateIsInferred: false });
            }

            return task;
        });
    }
}
