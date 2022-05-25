import type { FilterOrErrorMessage } from './Filter';

export abstract class Field {
    public abstract canCreateFilterForLine(line: string): boolean;

    public abstract createFilterOrErrorMessage(
        line: string,
    ): FilterOrErrorMessage;

    protected abstract filterRegexp(): RegExp;

    protected abstract fieldName(): string;
}
