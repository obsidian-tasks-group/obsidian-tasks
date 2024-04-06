import type { TasksFile } from '../Scripting/TasksFile';

/**
 * TaskLocation is the place where all information about a task line's location
 * in a markdown file is stored, so that testable algorithms can then be added here.
 */
export class TaskLocation {
    private readonly _tasksFile: TasksFile;
    private readonly _lineNumber: number;
    private readonly _sectionStart: number;
    private readonly _sectionIndex: number;
    private readonly _precedingHeader: string | null;

    public constructor(
        tasksFile: TasksFile,
        lineNumber: number,
        sectionStart: number,
        sectionIndex: number,
        precedingHeader: string | null,
    ) {
        this._tasksFile = tasksFile;
        this._lineNumber = lineNumber;
        this._sectionStart = sectionStart;
        this._sectionIndex = sectionIndex;
        this._precedingHeader = precedingHeader;
    }

    /**
     * Constructor, for use when the Task's exact location in a file is either unknown, or not needed.
     * @param tasksFile
     */
    public static fromUnknownPosition(tasksFile: TasksFile): TaskLocation {
        return new TaskLocation(tasksFile, 0, 0, 0, null);
    }

    /**
     * Constructor, for when the file has been renamed, and all other data remains the same.
     * @param newTasksFile
     */
    fromRenamedFile(newTasksFile: TasksFile) {
        return new TaskLocation(
            newTasksFile,
            this.lineNumber,
            this.sectionStart,
            this.sectionIndex,
            this.precedingHeader,
        );
    }

    public get tasksFile(): TasksFile {
        return this._tasksFile;
    }

    public get path(): string {
        return this._tasksFile.path;
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
