/**
 * A simple class to provide access to file information via 'task.file' in scripting code.
 */
export class TasksFile {
    private readonly _path: string;

    constructor(path: string) {
        this._path = path;
    }

    get path(): string {
        return this._path;
    }
}
