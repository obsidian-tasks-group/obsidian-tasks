import { TasksFile } from '../Scripting/TasksFile';

/**
 * TaskLocation is the place where all information about a task line's location
 * in a markdown file is stored, so that testable algorithms can then be added here.
 */
export class TaskLocation {
    public readonly tasksFile: TasksFile;
    private readonly _lineNumber: number;
    private readonly _sectionStart: number;
    private readonly _sectionIndex: number;
    private readonly _precedingHeader: string | null;

    public constructor(
        _path: string,
        tasksFile: TasksFile,
        lineNumber: number,
        sectionStart: number,
        sectionIndex: number,
        precedingHeader: string | null,
    ) {
        this.tasksFile = tasksFile;
        this._lineNumber = lineNumber;
        this._sectionStart = sectionStart;
        this._sectionIndex = sectionIndex;
        this._precedingHeader = precedingHeader;
    }

    /**
     * Constructor, for use when the Task's exact location in a file is either unknown, or not needed.
     * @param path
     */
    public static fromUnknownPosition(path: string): TaskLocation {
        return new TaskLocation(path, new TasksFile(path), 0, 0, 0, null);
    }

    /**
     * Constructor, for when the file has been renamed, and all other data remains the same.
     * @param newPath
     */
    fromRenamedFile(newPath: string) {
        return new TaskLocation(
            newPath,
            new TasksFile(newPath),
            this.lineNumber,
            this.sectionStart,
            this.sectionIndex,
            this.precedingHeader,
        );
    }

    public get path(): string {
        return this.tasksFile.path;
    }

    public get lineNumber(): number {
        return this._lineNumber;
    }

    /** Line number where the section starts that contains this task. */
    get sectionStart(): number {
        return this._sectionStart;
    }

    /** The index of the nth task in its section. */
    get sectionIndex(): number {
        return this._sectionIndex;
    }

    public get precedingHeader(): string | null {
        return this._precedingHeader;
    }

    /**
     * Whether the path is known, that-is, non-empty.
     *
     * This doesn't check whether the path points to an existing file.
     *
     * It was written to allow detection of tasks in Canvas cards, but note
     * that some editing code in this plugin does not bother to set the location
     * of the task, if not needed.
     */
    public get hasKnownPath(): boolean {
        return this.path !== '';
    }
}
