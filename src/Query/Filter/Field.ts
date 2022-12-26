import { Sorter } from '../Sorter';
import type { Comparator } from '../Sorter';
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
    // -----------------------------------------------------------------------------------------------------------------
    // Filtering
    // -----------------------------------------------------------------------------------------------------------------

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
     *
     * Also, some fields have more than one name, separated by '/'.
     * See {@link TagsField}, for example.
     * @public
     *
     * @see fieldNameSingular
     */
    public abstract fieldName(): string;

    /**
     * Returns the singular form of the field's name.
     * @public
     *
     * @see fieldName
     */
    public fieldNameSingular(): string {
        return this.fieldName();
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Return whether the code for this field implements sorting of tasks.
     *
     * If overriding this to return true, in order to enable sorting,
     * the method ${@link comparator} must also be overridden.
     */
    public supportsSorting(): boolean {
        return false;
    }

    /**
     * Parse a 'sort by' line and return a {@link Sorter} object.
     *
     * Returns null line does not match this field or is invalid,
     * or this field does not support sorting.
     */
    public parseSortLine(line: string): Sorter | null {
        if (!this.supportsSorting()) {
            return null;
        }

        if (!this.canCreateSorterForLine(line)) {
            return null;
        }

        return this.createSorterFromLine(line);
    }

    /**
     * Returns true if the class can parse the given 'sort by' instruction line.
     *
     * Current implementation simply checks whether the class does support sorting,
     * and whether the line matches this.sorterRegExp().
     * @param line - A line from a ```tasks``` block.
     *
     * @see {@link createSorterFromLine}
     */
    public canCreateSorterForLine(line: string): boolean {
        if (!this.supportsSorting()) {
            return false;
        }

        return Field.lineMatchesFilter(this.sorterRegExp(), line);
    }

    /**
     * Parse the line, and return either a {@link Sorter} object or null.
     *
     * This default implementation works for all fields that support
     * the default sorting pattern of `sort by <fieldName> (reverse)?`.
     *
     * Fields that offer more complicated 'sort by' options can override
     * this method.
     *
     * @param line - A 'sort by' line from a ```tasks``` block.
     *
     * @see {@link canCreateSorterForLine}
     */
    public createSorterFromLine(line: string): Sorter | null {
        if (!this.supportsSorting()) {
            return null;
        }

        const match = Field.getMatch(this.sorterRegExp(), line);
        if (match === null) {
            return null;
        }

        const reverse = !!match[1];
        return this.createSorter(reverse);
    }

    /**
     * Return a regular expression that will match a correctly-formed
     * instruction line for sorting Tasks by this field.
     *
     * Throws if this field does not support sorting.
     *
     * `match[1]` will be either `reverse` or undefined.
     *
     * Fields that offer more complicated 'sort by' options can override
     * this method.
     */
    protected sorterRegExp(): RegExp {
        if (!this.supportsSorting()) {
            throw Error(`sorterRegExp() unimplemented for ${this.fieldNameSingular()}`);
        }

        return new RegExp(`^sort by ${this.fieldNameSingular()}( reverse)?`);
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by this field's value.
     *
     * See ${@link supportsSorting} for what to do, to enable support of sorting in a
     * particular ${@link Field} implementation.
     */
    public comparator(): Comparator {
        throw Error(`comparator() unimplemented for ${this.fieldNameSingular()}`);
    }

    /**
     * Create a {@link Sorter} object for sorting tasks by this field's value.
     * @param reverse - false for normal sort order, true for reverse sort order.
     */
    public createSorter(reverse: boolean): Sorter {
        return new Sorter(this.fieldNameSingular(), this.comparator(), reverse);
    }

    /**
     * Create a {@link Sorter} object for sorting tasks by this field's value,
     * in the standard/normal sort order for this field.
     *
     * @see {@link createReverseSorter}
     */
    public createNormalSorter(): Sorter {
        return this.createSorter(false);
    }

    /**
     * Create a {@link Sorter} object for sorting tasks by this field's value,
     * in the reverse of the standard/normal sort order for this field.
     *
     * @see {@link createNormalSorter}
     */
    public createReverseSorter(): Sorter {
        return this.createSorter(true);
    }
}
