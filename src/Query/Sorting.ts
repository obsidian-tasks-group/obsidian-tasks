import type { Task } from '../Task';

/**
 * A sorting function, that takes two Task objects and returns
 * and returns one of:
 * - `-1` or some other negative number, if a is less than b by some ordering criterion.
 * - `+1` or some other positive number, if a is greater than b by the ordering criterion.
 * - `0` or sometimes `-0`, if a equals b by the ordering criterion.
 *
 * Typically Comparator functions are stored in a {@link Sorting} object.
 */
export type Comparator = (a: Task, b: Task) => number;

/**
 * Sorting represents a single 'sort by' instruction.
 * It stores the comparison function as a {@link Comparator}.
 */
export class Sorting {
    public readonly property: string;
    public readonly comparator: Comparator;

    /**
     * Constructor.
     *
     * TODO Once SortingProperty has been removed, re-order the parameters so the comparator comes first.
     *
     * @param reverse - whether the sort order should be reversed.
     * @param property - the name of the property. If {@link comparator} is not supplied, this string must match
     *                   one of the values in ${@link SortingProperty}.
     * @param comparator - {@link Comparator} function.
     */
    constructor(reverse: boolean, property: string, comparator: Comparator) {
        this.property = property;
        this.comparator = Sorting.maybeReverse(reverse, comparator);
    }

    private static maybeReverse(reverse: boolean, comparator: Comparator) {
        return reverse ? Sorting.makeReversedComparator(comparator) : comparator;
    }

    private static makeReversedComparator(comparator: Comparator): Comparator {
        // Note: This can return -0.
        return (a, b) => (comparator(a, b) * -1) as -1 | 0 | 1;
    }
}
