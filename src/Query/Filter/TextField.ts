import type { Task } from '../../Task';
import { Query } from '../../Query';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

export abstract class TextField extends Field {
    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        const match = line.match(this.filterRegexp());
        if (match !== null) {
            const filterMethod = match[1];
            if (filterMethod === 'includes') {
                result.filter = (task: Task) =>
                    Query.stringIncludesCaseInsensitive(
                        this.value(task),
                        match[2],
                    );
            } else if (match[1] === 'does not include') {
                result.filter = (task: Task) =>
                    !Query.stringIncludesCaseInsensitive(
                        this.value(task),
                        match[2],
                    );
            } else {
                result.error = `do not understand query filter (${this.fieldName()})`;
            }
        } else {
            result.error = `do not understand query filter (${this.fieldName()})`;
        }
        return result;
    }

    protected abstract filterRegexp(): RegExp;

    protected abstract fieldName(): string;

    protected abstract value(task: Task): string;
}
