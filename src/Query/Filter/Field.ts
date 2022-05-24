export abstract class Field {
    public abstract canCreateFilterForLine(line: string): boolean;

    public abstract createFilterOrErrorMessage(line: string): {
        filter: any;
        error: any;
    };

    protected abstract filterRegexp(): RegExp;

    protected abstract fieldName(): string;
}
