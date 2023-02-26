/**
 * TaskLineLocation will evolve in to the place where all information about a task line's location
 * in a markdown file will be stored, so that testable algorithms can then be added here.
 */
export class TaskLineLocation {
    private readonly _path: string;

    public constructor(path: string) {
        this._path = path;
    }

    public get path(): string {
        return this._path;
    }
}
