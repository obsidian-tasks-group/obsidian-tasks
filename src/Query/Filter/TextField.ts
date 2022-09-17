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
        let fieldName = this.fieldName();
        const match = Field.getMatch(this.filterRegexp(), line);

        if (match !== null) {
            // should always be the case if Field.canCreateFilterForLine() has been checked

            // Get the filter method (operator) and the search string (value)
            const [_, usedFieldName, filterMethod, searchString] = match;
            if (usedFieldName) {
                fieldName = usedFieldName;

                if (filterMethod && searchString) {
                    // should always be the case if the filterRegexp is correct

                    // Construct a matcher for this filter
                    let matcher: IStringMatcher | null = null;

                    if (filterMethod.includes('include')) {
                        matcher = new SubstringMatcher(searchString);
                    } else if (filterMethod.includes('match')) {
                        matcher = RegexMatcher.validateAndConstruct(searchString);
                        if (matcher === null) {
                            let msg = `cannot parse regular expression for ${fieldName}`;
                            if (!new RegExp('/(.*)/i?').test(searchString)) {
                                msg += '; check that it has leading and trailing slashes';
                            }
                            return FilterOrErrorMessage.fromError(msg);
                        }
                    }

                    if (matcher) {
                        // should always be the case if the filterRegexp is correct

                        // for fields with multiple values, use the appropriate filter
                        const filter = fieldName.includes('/')
                            ? (task: Task) => matcher!.matchesAnyOf(this.values(task))
                            : (task: Task) => matcher!.matches(this.value(task));

                        // Create the final Filter, that takes a task and tests
                        // if it matches the string filtering rule represented by this object.
                        return FilterOrErrorMessage.fromFilter((task: Task) =>
                            TextField.maybeNegate(filter(task), filterMethod),
                        );
                    }
                }
            }
        }

        return FilterOrErrorMessage.fromError(`do not understand query filter (${fieldName})`);
    }

    public static stringIncludesCaseInsensitive(haystack: string, needle: string): boolean {
        return SubstringMatcher.stringIncludesCaseInsensitive(haystack, needle);
    }

    protected filterRegexp(): RegExp {
        let fieldName = this.fieldName();
        let ops = 'includes|does not include|(?:regexp? )?(?:matches|does not match)';
        if (fieldName.includes('/')) {
            fieldName = fieldName.replace('/', '|');
            // add plural form of operators, but to be tolerant and backward compatible,
            // also allow the singular form of the operators
            ops += '|include|do not include|(?:regexp? )?(?:match|do not match)';
        }
        return new RegExp(`^(${fieldName}) (${ops}) (.+)`);
    }

    public abstract fieldName(): string;

    /**
     * Returns the field's value, or an empty string if the value is null
     * @param task
     * @public
     */
    public abstract value(task: Task): string;

    /**
     * Returns all of the field's values if there are multiple
     * @param task
     * @public
     */
    public values(task: Task): string[] {
        const value = this.value(task);
        return value ? [value] : [];
    }

    public static maybeNegate(match: boolean, filterMethod: String) {
        return filterMethod.match(/not/) ? !match : match;
    }
}
