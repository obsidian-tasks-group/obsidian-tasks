import type { Task } from '../../Task';
import { SubstringMatcher } from '../Matchers/SubstringMatcher';
import { RegexMatcher } from '../Matchers/RegexMatcher';
import type { IStringMatcher } from '../Matchers/IStringMatcher';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

/**
 * TextField is an abstract base class to help implement
 * all the filter instructions that act on a single type of string
 * value, such as the description or file path.
 */
export abstract class TextField extends Field {
    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const match = Field.getMatch(this.filterRegexp(), line);
        if (match === null) {
            // If Field.canCreateFilterForLine() has been checked, we should never get
            // in to this block.
            return FilterOrErrorMessage.fromError(
                `do not understand query filter (${this.fieldName()})`,
            );
        }

        // Construct an IStringMatcher for this filter, or return
        // if the inputs are invalid.
        const filterMethod = match[1];
        const searchString = match[2];
        let matcher: IStringMatcher | null = null;
        if (['includes', 'does not include'].includes(filterMethod)) {
            matcher = new SubstringMatcher(searchString);
        } else if (
            ['regex matches', 'regex does not match'].includes(filterMethod)
        ) {
            matcher = RegexMatcher.validateAndConstruct(searchString);
            if (matcher === null) {
                return FilterOrErrorMessage.fromError(
                    `cannot parse regex (${this.fieldName()}); check your leading and trailing slashes for your query`,
                );
            }
        }

        if (matcher === null) {
            // It's likely this can now never be reached.
            // Retained for safety, for now.
            return FilterOrErrorMessage.fromError(
                `do not understand query filter (${this.fieldName()})`,
            );
        }

        // Finally, we can create the Filter, that takes a task
        // and tests if it matches the string filtering rule
        // represented by this object.
        return FilterOrErrorMessage.fromFilter((task: Task) => {
            return TextField.maybeNegate(
                matcher!.matches(this.value(task)),
                filterMethod,
            );
        });
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
