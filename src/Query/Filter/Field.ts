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
     * this.filterRegexp().
     * @param line - A line from a ```tasks``` block.
     */
    public canCreateFilterForLine(line: string): boolean {
        return Field.lineMatchesFilter(this.filterRegexp, line);
    }

    /**
     * Parse the line, and return either a Filter function or an error string,
     * which are both wrapped in a FilterOrErrorMessage object.
     * @param line - A line from a ```tasks``` block.
     */
    public abstract createFilterOrErrorMessage(
        line: string,
    ): FilterOrErrorMessage;

    /**
     * Does the given line match the given filter?
     * @param filterRegexp - A RegExp regular expression, that specifies one query instruction.
     * @param line - A line from a tasks code block query.
     * @protected
     */
    protected static lineMatchesFilter(
        filterRegexp: () => RegExp,
        line: string,
    ): boolean {
        return filterRegexp().test(line);
    }

    /**
     * Return the match for the given filter, or null if it does not match
     * @param line - A line from a tasks code block query.
     * @param filterRegexp - A RegExp regular expression, that specifies one query instruction.
     * @protected
     */
    protected static getMatch(
        line: string,
        filterRegexp: RegExp,
    ): RegExpMatchArray | null {
        return line.match(filterRegexp);
    }

    /**
     * Return a regular expression that will match a correctly-formed
     * instruction line for filtering Tasks by inspecting the value of this field.
     * @protected
     */
    protected abstract filterRegexp(): RegExp;

    /**
     * Return the name of this field, to be used in error messages.
     * This usually matches the instruction name, but does not always
     * (see start and starts).
     * @protected
     */
    protected abstract fieldName(): string;
}
