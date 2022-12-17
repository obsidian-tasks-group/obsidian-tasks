import { Sorting } from '../Sorting';
import type { Comparator } from '../Sorting';
import type { FilterOrErrorMessage } from './Filter';

/**
 * Field is an abstract base class for each type of filter instruction.
 *
 * For example, derived class StartDateField implements the parsing
 * of 'starts' instructions.
 *
 * The name 'Field' may seem confusing, as it might currently be
 * expected to have the word 'Filter' in the class name.
 *
 * Current thinking is that it may well evolve later to also implement
 * the presence and absence searches as well
 * (such 'no start date' and 'has start date').
 */
export abstract class Field {
    /**
     * Returns true if the class can parse the given instruction line.
     *
     * Current implementation simply checks whether the line matches
     * this.filterRegExp().
     * @param line - A line from a ```tasks``` block.
     */
    public canCreateFilterForLine(line: string): boolean {
        return Field.lineMatchesFilter(this.filterRegExp(), line);
    }

    /**
     * Parse the line, and return either a Filter function or an error string,
     * which are both wrapped in a FilterOrErrorMessage object.
     * @param line - A line from a ```tasks``` block.
     */
    public abstract createFilterOrErrorMessage(line: string): FilterOrErrorMessage;

    /**
     * Does the given line match the given filter?
     * @param filter - A RegExp regular expression, that specifies one query instruction.
     *                 Or null, if the field does not support regexp-based filtering.
     * @param line - A line from a tasks code block query.
     * @protected
     */
    protected static lineMatchesFilter(filter: RegExp | null, line: string): boolean {
        if (filter) {
            return filter.test(line);
        } else {
            return false;
        }
    }

    /**
     * Return the match for the given filter, or null if it does not match
     * @param filterRegExp - A RegExp regular expression, that specifies one query instruction.
     *                       Or null, if the field does not support regexp-based filtering.
     * @param line - A line from a tasks code block query.
     * @protected
     */
    protected static getMatch(filterRegExp: RegExp | null, line: string): RegExpMatchArray | null {
        if (filterRegExp) {
            return line.match(filterRegExp);
        } else {
            return null;
        }
    }

    /**
     * Return a regular expression that will match a correctly-formed
     * instruction line for filtering Tasks by inspecting the value of this field.
     * Or null, if this field does not have a regex-based instruction.
     * @protected
     */
    protected abstract filterRegExp(): RegExp | null;

    /**
     * Return the name of this field, to be used in error messages.
     * This usually matches the instruction name, but does not always
     * (see start and starts).
     * @public
     */
    public abstract fieldName(): string;

    /**
     * Return whether the code for this field implements sorting of tasks
     */
    public supportsSorting(): boolean {
        // TODO Make abstract
        return false;
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by this field's value.
     */
    public comparator(): Comparator {
        // TODO Make abstract
        throw Error(`comparator() unimplemented for ${this.fieldName()}`);
    }

    /**
     * Create a {@link Sorting} object for sorting tasks by this field's value.
     * @param reverse - false for normal sort order, true for reverse sort order.
     */
    public createSorter(reverse: boolean): Sorting {
        return new Sorting(reverse, this.fieldName(), this.comparator());
    }

    /**
     * Create a {@link Sorting} object for sorting tasks by this field's value,
     * in the standard/normal sort order for this field.
     *
     * @see {@link createReverseSorter}
     */
    public createNormalSorter(): Sorting {
        return this.createSorter(false);
    }

    /**
     * Create a {@link Sorting} object for sorting tasks by this field's value,
     * in the reverse of the standard/normal sort order for this field.
     *
     * @see {@link createNormalSorter}
     */
    public createReverseSorter(): Sorting {
        return this.createSorter(true);
    }
}
