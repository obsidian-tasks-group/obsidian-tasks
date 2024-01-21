import type { Task } from '../../Task/Task';
import { SubstringMatcher } from '../Matchers/SubstringMatcher';
import { RegexMatcher } from '../Matchers/RegexMatcher';
import type { IStringMatcher } from '../Matchers/IStringMatcher';
import type { Comparator } from '../Sort/Sorter';
import type { GrouperFunction } from '../Group/Grouper';
import { errorMessageForException } from '../../lib/ExceptionTools';
import { Field } from './Field';
import type { FilterFunction } from './Filter';
import { Filter } from './Filter';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

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
        const filterOperator = match[1].toLowerCase();
        const filterValue = match[2];

        let matcher: IStringMatcher | null = null;
        if (filterOperator.includes('include')) {
            matcher = new SubstringMatcher(filterValue);
        } else if (filterOperator.includes('regex')) {
            try {
                matcher = RegexMatcher.validateAndConstruct(filterValue);
            } catch (e) {
                const message =
                    errorMessageForException('Parsing regular expression', e) + `\n\n${RegexMatcher.helpMessage()}`;
                return FilterOrErrorMessage.fromError(line, message);
            }
            if (matcher === null) {
                return FilterOrErrorMessage.fromError(
                    line,
                    `Invalid instruction: '${line}'\n\n${RegexMatcher.helpMessage()}`,
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
        const filter = new Filter(line, this.getFilter(matcher, negate), matcher.explanation(line));
        return FilterOrErrorMessage.fromFilter(filter);
    }

    /**
     * Returns a regexp pattern matching the field's name and possible aliases
     */
    protected fieldPattern(): string {
        return this.fieldNameSingularEscaped();
    }

    /**
     * Returns a regexp pattern matching all possible filter operators for this field,
     * such as "includes" or "does not include".
     */
    protected filterOperatorPattern(): string {
        return 'includes|does not include|regex matches|regex does not match';
    }

    protected filterRegExp(): RegExp {
        return new RegExp(`^(?:${this.fieldPattern()}) (${this.filterOperatorPattern()}) (.*)`, 'i');
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

    /**
     * A default implementation of grouping, for text fields where simple grouping by field value is the
     * desired behaviour.
     *
     * Each class that wants to use this will need to override supportsGrouping() to return true,
     * to turn on grouping.
     */
    public grouper(): GrouperFunction {
        return (task: Task) => {
            return [this.value(task)];
        };
    }

    public static escapeMarkdownCharacters(filename: string) {
        // https://wilsonmar.github.io/markdown-text-for-github-from-html/#special-characters
        return filename.replace(/\\/g, '\\\\').replace(/_/g, '\\_');
    }
}
