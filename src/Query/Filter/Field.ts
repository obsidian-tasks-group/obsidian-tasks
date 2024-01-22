import { Sorter } from '../Sort/Sorter';
import type { Comparator } from '../Sort/Sorter';
import * as RegExpTools from '../../lib/RegExpTools';
import { Grouper } from '../Group/Grouper';
import type { GrouperFunction } from '../Group/Grouper';
import type { FilterOrErrorMessage } from './FilterOrErrorMessage';

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
     * @see fieldNameSingularEscaped
     */
    public abstract fieldName(): string;

    /**
     * Returns the singular form of the field's name.
     * @public
     *
     * @see fieldName
     * @see fieldNameSingularEscaped
     */
    public fieldNameSingular(): string {
        return this.fieldName();
    }

    /**
     * Returns the singular form of the field's name, escaped for use in regular expressions.
     *
     * This is needed for field names that contain `.` in, for example.
     * @public
     *
     * @see fieldName
     * @see fieldNameSingular
     */
    public fieldNameSingularEscaped() {
        return RegExpTools.escapeRegExp(this.fieldNameSingular());
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Return whether the code for this field implements sorting of tasks.
     *
     * If overriding this to return true, in order to enable sorting,
     * the method {@link comparator} must also be overridden.
     */
    public supportsSorting(): boolean {
        return false;
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

        return new RegExp(`^sort by ${this.fieldNameSingularEscaped()}( reverse)?`, 'i');
    }

    /**
     * Reconstruct a 'sorter by' instruction to use for sorting of this field.
     *
     * This is used to simplify the construction of {@link Sorter} objects.
     * @param reverse
     * @protected
     */
    protected sorterInstruction(reverse: boolean) {
        let instruction = `sort by ${this.fieldNameSingular()}`;
        if (reverse) {
            instruction += ' reverse';
        }
        return instruction;
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by this field's value.
     *
     * See {@link supportsSorting} for what to do, to enable support of sorting in a
     * particular {@link Field} implementation.
     */
    public comparator(): Comparator {
        throw Error(`comparator() unimplemented for ${this.fieldNameSingular()}`);
    }

    /**
     * Create a {@link Sorter} object for sorting tasks by this field's value.
     * @param reverse - false for normal sort order, true for reverse sort order.
     */
    public createSorter(reverse: boolean): Sorter {
        return new Sorter(this.sorterInstruction(reverse), this.fieldNameSingular(), this.comparator(), reverse);
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

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Return whether the code for this field implements grouping of tasks.
     *
     * If overriding this to return true, in order to enable grouping,
     * the method {@link grouper} must also be overridden.
     */
    public supportsGrouping(): boolean {
        return false;
    }

    /**
     * Parse the line, and return either a {@link Grouper} object or null.
     *
     * This default implementation works for all fields that support
     * the default grouping pattern of `group by <fieldName> (reverse)?`.
     *
     * Fields that offer more complicated 'group by' options can override
     * this method.
     *
     * @param line - A 'group by' line from a ```tasks``` block.
     */
    public createGrouperFromLine(line: string): Grouper | null {
        if (!this.supportsGrouping()) {
            return null;
        }

        const match = Field.getMatch(this.grouperRegExp(), line);
        if (match === null) {
            return null;
        }

        const reverse = !!match[1];
        return this.createGrouper(reverse);
    }

    /**
     * Return a regular expression that will match a correctly-formed
     * instruction line for grouping Tasks by this field.
     *
     * Throws if this field does not support grouping.
     *
     * `match[1]` will be either `reverse` or undefined.
     *
     * Fields that offer more complicated 'group by' options can override
     * this method.
     */
    protected grouperRegExp(): RegExp {
        if (!this.supportsGrouping()) {
            throw Error(`grouperRegExp() unimplemented for ${this.fieldNameSingular()}`);
        }

        // The $ at end is required to distinguish between group by status and status.name
        return new RegExp(`^group by ${this.fieldNameSingularEscaped()}( reverse)?$`, 'i');
    }

    /**
     * Reconstruct a 'group by' instruction to use for grouping of this field.
     *
     * This is used to simplify the construction of Grouper objects.
     * @param reverse
     * @protected
     */
    protected grouperInstruction(reverse: boolean) {
        let instruction = `group by ${this.fieldNameSingular()}`;
        if (reverse) {
            instruction += ' reverse';
        }
        return instruction;
    }

    /**
     * Return a function to get a list of a task's group names, for use in grouping by this field's value.
     *
     * See {@link supportsGrouping} for what to do, to enable support of grouping in a
     * particular {@link Field} implementation.
     */
    public grouper(): GrouperFunction {
        throw Error(`grouper() unimplemented for ${this.fieldNameSingular()}`);
    }

    /**
     * Create a {@link Grouper} object for grouping tasks by this field's value.
     * @param reverse - false for normal group order, true for reverse group order.
     */
    public createGrouper(reverse: boolean): Grouper {
        return new Grouper(this.grouperInstruction(reverse), this.fieldNameSingular(), this.grouper(), reverse);
    }

    /**
     * Create a {@link Grouper} object for grouping tasks by this field's value,
     * in the standard/normal group order for this field.
     *
     * @see {@link createReverseGrouper}
     */
    public createNormalGrouper(): Grouper {
        return this.createGrouper(false);
    }

    /**
     * Create a {@link Grouper} object for grouping tasks by this field's value,
     * in the reverse of the standard/normal group order for this field.
     *
     * @see {@link createNormalGrouper}
     */
    public createReverseGrouper(): Grouper {
        return this.createGrouper(true);
    }
}
