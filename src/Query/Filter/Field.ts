import type { FilterOrErrorMessage } from './Filter';

export abstract class Field {
    public canCreateFilterForLine(line: string): boolean {
        return this.filterRegexp().test(line);
    }

    public abstract createFilterOrErrorMessage(
        line: string,
    ): FilterOrErrorMessage;

    protected abstract filterRegexp(): RegExp;

    protected abstract fieldName(): string;
}
