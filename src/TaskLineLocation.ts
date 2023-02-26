/**
 * TaskLineLocation will evolve in to the place where all information about a task line's location
 * in a markdown file will be stored, so that testable algorithms can then be added here.
 */
export class TaskLineLocation {
    private readonly _path: string;
    private readonly _sectionStart: number;

    public constructor(path: string, sectionStart: number) {
        this._path = path;
        this._sectionStart = sectionStart;
    }

    public get path(): string {
        return this._path;
    }

    /** Line number where the section starts that contains this task. */
    get sectionStart(): number {
        return this._sectionStart;
    }
}
