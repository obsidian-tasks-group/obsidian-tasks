import type { TasksFile } from './TasksFile';

export type GetActiveFileFn = () => TasksFile | undefined;

const defaultGetActiveFileFn: GetActiveFileFn = () => undefined;

/**
 * An abstraction to implement `query.activeFile`: the file open in the most recently active
 * leaf of the main editing area, as opposed to `query.file`, the file containing the query.
 *
 * See also:
 * - `src/main.ts` - search for `ActiveFile.getInstance()`
 */
export class ActiveFile {
    private static instance: ActiveFile;

    private getActiveFileFn: GetActiveFileFn = defaultGetActiveFileFn;

    public setGetActiveFileFn(getActiveFileFn: GetActiveFileFn) {
        this.getActiveFileFn = getActiveFileFn;
    }

    public resetGetActiveFileFn() {
        this.getActiveFileFn = defaultGetActiveFileFn;
    }

    public get(): TasksFile | undefined {
        return this.getActiveFileFn();
    }

    /**
     * Provides access to the single global instance of the ActiveFile.
     * This should be used in the plugin code.
     */
    public static getInstance(): ActiveFile {
        if (!ActiveFile.instance) {
            ActiveFile.instance = new ActiveFile();
        }

        return ActiveFile.instance;
    }
}
