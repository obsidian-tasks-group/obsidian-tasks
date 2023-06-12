/**
 * A simple class to provide access to file information via 'task.file' in scripting code.
 */
export class TasksFile {
    private readonly _path: string;

    constructor(path: string) {
        this._path = path;
    }

    /**
     * Return the path to the file.
     */
    get path(): string {
        return this._path;
    }

    /**
     * Return the filename including the extension.
     */
    get filename(): string {
        // Copied from Task.filename and FilenameField.value() initially
        const fileNameMatch = this.path.match(/([^/]+)$/);
        if (fileNameMatch !== null) {
            return fileNameMatch[1];
        } else {
            return '';
        }
    }
}
