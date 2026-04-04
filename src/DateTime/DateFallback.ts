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
 * Fields that DateFallback methods may modify. Callers use this
 * to construct a new Task with the updated values.
 */
export interface DateFallbackUpdate {
    scheduledDate: Moment | null;
    scheduledDateIsInferred: boolean;
    taskLocation?: TaskLocation;
}

/**
 * Implement date from path detection
 */
export class DateFallback {

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
     * Compute the updated date fallback fields when a task's file has moved.
     * Returns the fields that need to change; the caller constructs the new Task.
     *
     * @param task         - task to update
     * @param newLocation  - new location
     * @param fallbackDate - fallback date from new location, for efficiency. Can be null
     */
    public static updateTaskPath(
        task: TaskWithDateFallbackFields,
        newLocation: TaskLocation,
        fallbackDate: Moment | null,
    ): DateFallbackUpdate {
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

        return {
            taskLocation: newLocation,
            scheduledDate,
            scheduledDateIsInferred,
        };
    }

    /**
     * For each task in updatedTasks, check if the inferred scheduled date status should be removed
     * because the scheduled date was modified compared to the original.
     * Returns an array of booleans: true means scheduledDateIsInferred should be set to false for that task.
     * The caller is responsible for constructing new Task objects when needed.
     */
    public static removeInferredStatusIfNeeded(
        originalTask: TaskWithDateFallbackFields,
        updatedTasks: TaskWithDateFallbackFields[],
    ): boolean[] {
        const inferredScheduledDate = originalTask.scheduledDateIsInferred ? originalTask.scheduledDate : null;

        return updatedTasks.map((task) => {
            if (inferredScheduledDate !== null && !inferredScheduledDate.isSame(task.scheduledDate, 'day')) {
                return true; // caller should set scheduledDateIsInferred = false
            }
            return false;
        });
    }
}
