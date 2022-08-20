import type { Task } from '../../Task';
import { SubstringMatcher } from '../Matchers/SubstringMatcher';
import { RegexMatcher } from '../Matchers/RegexMatcher';
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
            if (['includes', 'does not include'].includes(filterMethod)) {
                const matcher = new SubstringMatcher(match[2]);
                result.filter = (task: Task) => {
                    return TextField.maybeNegate(
                        matcher.matches(this.value(task)),
                        filterMethod,
                    );
                };
            } else if (
                ['regex matches', 'regex does not match'].includes(filterMethod)
            ) {
                const matcher = RegexMatcher.validateAndConstruct(match[2]);
                if (matcher !== null) {
                    result.filter = (task: Task) => {
                        return TextField.maybeNegate(
                            matcher.matches(this.value(task)),
                            filterMethod,
                        );
                    };
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
        return SubstringMatcher.stringIncludesCaseInsensitive(haystack, needle);
    }

    protected filterRegexp(): RegExp {
        return new RegExp(
            `^${this.fieldName()} (includes|does not include|regex matches|regex does not match) (.*)`,
        );
    }

    protected abstract fieldName(): string;

    /**
     * Returns the field's value, or an empty string if the value is null
     * @param task
     * @protected
     */
    protected abstract value(task: Task): string;

    public static maybeNegate(match: boolean, filterMethod: String) {
        return filterMethod.match(/not/) ? !match : match;
    }
}
