import type { Task } from '../../Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

/**
 * TextField is an abstract base class to help implement
 * all the filter instructions that act on a single type of string
 * value, such as the description or file path.
 */
export abstract class TextField extends Field {
    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        const match = Field.getMatch(this.filterRegexp(), line);
        if (match !== null) {
            const filterMethod = match[1];
            if (filterMethod === 'includes') {
                result.filter = (task: Task) =>
                    TextField.stringIncludesCaseInsensitive(
                        this.value(task),
                        match[2],
                    );
            } else if (match[1] === 'does not include') {
                result.filter = (task: Task) =>
                    !TextField.stringIncludesCaseInsensitive(
                        this.value(task),
                        match[2],
                    );
            } else if (match[1] === 'regex matches') {
                // Trim the leading and trailing '/'
                const regexPattern = /^\/(.*)\/$/;
                const query = match[2].match(regexPattern);

                if (query !== null) {
                    result.filter = (task: Task) =>
                        this.value(task).match(query![1]) !== null;
                } else {
                    result.error = `cannot parse regex (${this.fieldName()}); check your leading and trailing slashes for your query`;
                }
            } else {
                result.error = `do not understand query filter (${this.fieldName()})`;
            }
        } else {
            result.error = `do not understand query filter (${this.fieldName()})`;
        }
        return result;
    }

    public static stringIncludesCaseInsensitive(
        haystack: string,
        needle: string,
    ): boolean {
        return haystack
            .toLocaleLowerCase()
            .includes(needle.toLocaleLowerCase());
    }

    protected filterRegexp(): RegExp {
        return new RegExp(
            `^${this.fieldName()} (includes|does not include) (.*)`,
        );
    }

    protected abstract fieldName(): string;

    /**
     * Returns the field's value, or an empty string if the value is null
     * @param task
     * @protected
     */
    protected abstract value(task: Task): string;
}
