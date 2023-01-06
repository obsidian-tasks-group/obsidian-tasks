import type { Task } from '../../Task';
import { SubstringMatcher } from '../Matchers/SubstringMatcher';
import { RegexMatcher } from '../Matchers/RegexMatcher';
import type { IStringMatcher } from '../Matchers/IStringMatcher';
import { Explanation } from '../Explain/Explanation';
import type { Comparator } from '../Sorter';
import { Field } from './Field';
import type { FilterFunction } from './Filter';
import { Filter, FilterOrErrorMessage } from './Filter';

/**
 * TextField is an abstract base class to help implement
 * all the filter instructions that act on a single type of string
 * value, such as the description or file path.
 */
export abstract class TextField extends Field {
    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const match = Field.getMatch(this.filterRegExp(), line);
        if (match === null) {
            // If Field.canCreateFilterForLine() has been checked, we should never get
            // in to this block.
            return FilterOrErrorMessage.fromError(line, `do not understand query filter (${this.fieldName()})`);
        }

        // Construct an IStringMatcher for this filter, or return
        // if the inputs are invalid.
        const [_, filterOperator, filterValue] = match;
        let matcher: IStringMatcher | null = null;
        if (filterOperator.includes('include')) {
            matcher = new SubstringMatcher(filterValue);
        } else if (filterOperator.includes('regex')) {
            matcher = RegexMatcher.validateAndConstruct(filterValue);
            if (matcher === null) {
                return FilterOrErrorMessage.fromError(
                    line,
                    `cannot parse regex (${this.fieldName()}); check your leading and trailing slashes for your query`,
                );
            }
        }

        if (matcher === null) {
            // It's likely this can now never be reached.
            // Retained for safety, for now.
            return FilterOrErrorMessage.fromError(line, `do not understand query filter (${this.fieldName()})`);
        }

        // Finally, we can create the Filter, that takes a task
        // and tests if it matches the string filtering rule
        // represented by this object.
        const negate = filterOperator.match(/not/) !== null;
        const filter = new Filter(line, this.getFilter(matcher, negate), new Explanation(line));
        return FilterOrErrorMessage.fromFilter(filter);
    }

    /**
     * Returns a regexp pattern matching the field's name and possible aliases
     */
    protected fieldPattern(): string {
        return this.fieldName();
    }

    /**
     * Returns a regexp pattern matching all possible filter operators for this field,
     * such as "includes" or "does not include".
     */
    protected filterOperatorPattern(): string {
        return 'includes|does not include|regex matches|regex does not match';
    }

    protected filterRegExp(): RegExp {
        return new RegExp(`^(?:${this.fieldPattern()}) (${this.filterOperatorPattern()}) (.*)`);
    }

    public abstract fieldName(): string;

    /**
     * Returns the field's value, or an empty string if the value is null
     * @param task
     * @public
     */
    public abstract value(task: Task): string;

    protected getFilter(matcher: IStringMatcher, negate: boolean): FilterFunction {
        return (task: Task) => {
            const match = matcher!.matches(this.value(task));
            return negate ? !match : match;
        };
    }

    /**
     * A default implementation of sorting, for text fields where simple locale-aware sorting is the
     * desired behaviour.
     *
     * Each class that wants to use this will need to override supportsSorting() to return true,
     * to turn on sorting.
     */
    comparator(): Comparator {
        return (a: Task, b: Task) => {
            return this.value(a).localeCompare(this.value(b), undefined, { numeric: true });
        };
    }
}
