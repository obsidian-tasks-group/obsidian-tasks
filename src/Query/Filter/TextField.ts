import type { Task } from '../../Task';
import { SubstringMatcher } from '../Matchers/SubstringMatcher';
import { RegexMatcher } from '../Matchers/RegexMatcher';
import type { IStringMatcher } from '../Matchers/IStringMatcher';
import { Field } from './Field';
import { type Filter, FilterOrErrorMessage } from './Filter';

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
            return FilterOrErrorMessage.fromError(`do not understand query filter (${this.fieldName()})`);
        }

        // Construct an IStringMatcher for this filter, or return
        // if the inputs are invalid.
        const [_, operator, value] = match;
        let matcher: IStringMatcher | null = null;
        if (operator.includes('include')) {
            matcher = new SubstringMatcher(value);
        } else if (operator.includes('regex')) {
            matcher = RegexMatcher.validateAndConstruct(value);
            if (matcher === null) {
                return FilterOrErrorMessage.fromError(
                    `cannot parse regex (${this.fieldName()}); check your leading and trailing slashes for your query`,
                );
            }
        }

        if (matcher === null) {
            // It's likely this can now never be reached.
            // Retained for safety, for now.
            return FilterOrErrorMessage.fromError(`do not understand query filter (${this.fieldName()})`);
        }

        // Finally, we can create the Filter, that takes a task
        // and tests if it matches the string filtering rule
        // represented by this object.
        const negate = operator.match(/not/) !== null;
        return FilterOrErrorMessage.fromFilter(this.getFilter(matcher, negate));
    }

    public static stringIncludesCaseInsensitive(haystack: string, needle: string): boolean {
        return SubstringMatcher.stringIncludesCaseInsensitive(haystack, needle);
    }

    protected fieldPattern(): string {
        return this.fieldName();
    }

    protected operatorPattern(): string {
        return 'includes|does not include|regex matches|regex does not match';
    }

    protected filterRegexp(): RegExp {
        return new RegExp(`^(?:${this.fieldPattern()}) (${this.operatorPattern()}) (.*)`);
    }

    public abstract fieldName(): string;

    /**
     * Returns the field's value, or an empty string if the value is null
     * @param task
     * @public
     */
    public abstract value(task: Task): string;

    protected getFilter(matcher: IStringMatcher, negate: boolean): Filter {
        return (task: Task) => {
            const match = matcher!.matches(this.value(task));
            return negate ? !match : match;
        };
    }
}
