/**
 * TaskLineLocation will evolve in to the place where all information about a task line's location
 * in a markdown file will be stored, so that testable algorithms can then be added here.
 */
export class TaskLineLocation {
    private readonly _path: string;
    private readonly _sectionStart: number;
    private readonly _sectionIndex: number;

    public constructor(path: string, sectionStart: number, sectionIndex: number) {
        this._path = path;
        this._sectionStart = sectionStart;
        this._sectionIndex = sectionIndex;
    }

    /**
     * Constructor, for use when the Task's exact location in a file is either unknown, or not needed.
     * @param path
     */
    public static fromUnknownPosition(path: string): TaskLineLocation {
        return new TaskLineLocation(path, 0, 0);
    }

    /**
     * Constructor, for when the file has been renamed, and all other data remains the same.
     * @param newPath
     */
    fromRenamedFile(newPath: string) {
        return new TaskLineLocation(newPath, this.sectionStart, this.sectionIndex);
    }

    public get path(): string {
        return this._path;
    }

    /** Line number where the section starts that contains this task. */
    get sectionStart(): number {
        return this._sectionStart;
    }

    /** The index of the nth task in its section. */
    get sectionIndex(): number {
        return this._sectionIndex;
    }
}
