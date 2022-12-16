import type moment from 'moment';
import type { Task } from '../Task';
import { getSettings } from '../Config/Settings';
import type { Query, SortingProperty } from './Query';
// TODO Remove the cyclic dependency between StatusField and Sort.
import { StatusField } from './Filter/StatusField';
import { DueDateField } from './Filter/DueDateField';

/**
 * A sorting function, that takes two Task objects and returns
 * and returns one of:
 * - `-1` or some other negative number, if a is less than b by some ordering criterion.
 * - `+1` or some other positive number, if a is greater than b by the ordering criterion.
 * - `0` or sometimes `-0`, if a equals b by the ordering criterion.
 *
 * Typically Comparator functions are stored in a {@link Sorting} object.
 */
// TODO Move to Sorting.ts
export type Comparator = (a: Task, b: Task) => number;

/**
 * Sorting represents a single 'sort by' instruction.
 * It stores the comparison function as a {@link Comparator}.
 */
// TODO Move to Sorting.ts
export class Sorting {
    public readonly property: string;
    public readonly comparator: Comparator;
    public readonly propertyInstance: number;

    /**
     * Constructor.
     *
     * TODO Once SortingProperty has been removed, re-order the parameters so the comparator comes first.
     *
     * @param reverse - whether the sort order should be reversed.
     * @param propertyInstance - for tag sorting, this is a 1-based index for the tag number in the task to sort by.
     *                           TODO eventually, move this number to the comparator used for sorting by tag.
     * @param property - the name of the property. If {@link comparator} is not supplied, this string must match
     *                   one of the values in ${@link SortingProperty}.
     * @param comparator - optional {@link Comparator} function. This will eventually become required, and will then be moved to
     *                     the first parameter.
     */
    constructor(reverse: boolean, propertyInstance: number, property: string, comparator?: Comparator) {
        this.property = property;
        this.propertyInstance = propertyInstance;
        if (comparator) {
            this.comparator = Sorting.maybeReverse(reverse, comparator);
        } else {
            // TODO Move comparator mandatory so can remove reference to this.makeComparator
            this.comparator = this.makeComparator(reverse);
        }
    }

    /**
     * Legacy function, for creating a Comparator for a SortingProperty value.
     *
     * TODO Once SortingProperty in Query.ts has been removed, remove this method.
     * @param reverse
     */
    public makeComparator(reverse: boolean) {
        // TODO Move this to Sort class
        const comparator = Sort.comparators[this.property as SortingProperty];
        if (!comparator) {
            throw Error('Unrecognised legacy sort keyword: ' + this.property);
        }
        return Sorting.maybeReverse(reverse, comparator);
    }

    private static maybeReverse(reverse: boolean, comparator: Comparator) {
        return reverse ? Sort.makeReversedComparator(comparator) : comparator;
    }
}

export class Sort {
    static tagPropertyInstance: number = 1;

    public static by(query: Pick<Query, 'sorting'>, tasks: Task[]): Task[] {
        // TODO Move code for creating default comparators to separate file
        const defaultComparators: Comparator[] = [
            Sort.compareByUrgency,
            new StatusField().comparator(),
            new DueDateField().comparator(),
            Sort.compareByPriority,
            Sort.compareByPath,
        ];

        const userComparators: Comparator[] = [];

        for (const sorting of query.sorting) {
            userComparators.push(sorting.comparator);
            if (sorting.property === 'tag') {
                Sort.tagPropertyInstance = sorting.propertyInstance;
            }
        }

        return tasks.sort(Sort.makeCompositeComparator([...userComparators, ...defaultComparators]));
    }

    public static comparators: Record<SortingProperty, Comparator> = {
        urgency: Sort.compareByUrgency,
        description: Sort.compareByDescription,
        priority: Sort.compareByPriority,
        start: Sort.compareByStartDate,
        scheduled: Sort.compareByScheduledDate,
        done: Sort.compareByDoneDate,
        path: Sort.compareByPath,
        tag: Sort.compareByTag,
    };

    public static makeReversedComparator(comparator: Comparator): Comparator {
        // Note: This can return -0.
        return (a, b) => (comparator(a, b) * -1) as -1 | 0 | 1;
    }

    private static makeCompositeComparator(comparators: Comparator[]): Comparator {
        return (a, b) => {
            for (const comparator of comparators) {
                const result = comparator(a, b);
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        };
    }

    private static compareByUrgency(a: Task, b: Task): number {
        // Higher urgency should be sorted earlier.
        return b.urgency - a.urgency;
    }

    private static compareByPriority(a: Task, b: Task): number {
        return a.priority.localeCompare(b.priority);
    }

    private static compareByStartDate(a: Task, b: Task): -1 | 0 | 1 {
        return Sort.compareByDate(a.startDate, b.startDate);
    }

    private static compareByScheduledDate(a: Task, b: Task): -1 | 0 | 1 {
        return Sort.compareByDate(a.scheduledDate, b.scheduledDate);
    }

    private static compareByDoneDate(a: Task, b: Task): -1 | 0 | 1 {
        return Sort.compareByDate(a.doneDate, b.doneDate);
    }

    private static compareByTag(a: Task, b: Task): -1 | 0 | 1 {
        // If no tags then assume they are equal.
        if (a.tags.length === 0 && b.tags.length === 0) {
            return 0;
        } else if (a.tags.length === 0) {
            // a is less than b
            return 1;
        } else if (b.tags.length === 0) {
            // b is less than a
            return -1;
        }

        // Arrays start at 0 but the users specify a tag starting at 1.
        const tagInstanceToSortBy = Sort.tagPropertyInstance - 1;

        if (a.tags.length < Sort.tagPropertyInstance && b.tags.length >= Sort.tagPropertyInstance) {
            return 1;
        } else if (b.tags.length < Sort.tagPropertyInstance && a.tags.length >= Sort.tagPropertyInstance) {
            return -1;
        } else if (a.tags.length < Sort.tagPropertyInstance && b.tags.length < Sort.tagPropertyInstance) {
            return 0;
        }

        if (a.tags[tagInstanceToSortBy] < b.tags[tagInstanceToSortBy]) {
            return -1;
        } else if (a.tags[tagInstanceToSortBy] > b.tags[tagInstanceToSortBy]) {
            return 1;
        } else {
            return 0;
        }
    }

    public static compareByDate(a: moment.Moment | null, b: moment.Moment | null): -1 | 0 | 1 {
        if (a !== null && b === null) {
            return -1;
        } else if (a === null && b !== null) {
            return 1;
        } else if (a !== null && b !== null) {
            if (a.isValid() && !b.isValid()) {
                return -1;
            } else if (!a.isValid() && b.isValid()) {
                return 1;
            }

            if (a.isAfter(b)) {
                return 1;
            } else if (a.isBefore(b)) {
                return -1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    private static compareByPath(a: Task, b: Task): -1 | 0 | 1 {
        if (a.path < b.path) {
            return -1;
        } else if (a.path > b.path) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * Compare the description by how it is rendered in markdown.
     *
     * Does not use the MarkdownRenderer, but tries to match regexes instead
     * in order to be simpler, faster, and not async.
     */
    private static compareByDescription(a: Task, b: Task) {
        return Sort.cleanDescription(a.description).localeCompare(Sort.cleanDescription(b.description));
    }

    /**
     * Removes `*`, `=`, and `[` from the beginning of the description.
     *
     * Will remove them only if they are closing.
     * Properly reads links [[like this|one]] (note pipe).
     */
    private static cleanDescription(description: string): string {
        const globalFilter = getSettings().globalFilter;
        description = description.replace(globalFilter, '').trim();

        const startsWithLinkRegex = /^\[\[?([^\]]*)\]/;
        const linkRegexMatch = description.match(startsWithLinkRegex);
        if (linkRegexMatch !== null) {
            const innerLinkText = linkRegexMatch[1];
            // For a link, we have to check whether it has another visible name set.
            // For example `[[this is the link|but this is actually shown]]`.
            description =
                innerLinkText.substring(innerLinkText.indexOf('|') + 1) + description.replace(startsWithLinkRegex, '');
        }

        const startsWithItalicOrBoldRegex = /^\*\*?([^*]*)\*/;
        const italicBoldRegexMatch = description.match(startsWithItalicOrBoldRegex);
        if (italicBoldRegexMatch !== null) {
            const innerItalicBoldText = italicBoldRegexMatch[1];
            description = innerItalicBoldText + description.replace(startsWithLinkRegex, '');
        }

        const startsWithHighlightRegex = /^==?([^=]*)==/;
        const highlightRegexMatch = description.match(startsWithHighlightRegex);
        if (highlightRegexMatch !== null) {
            const innerHighlightsText = highlightRegexMatch[1];
            description = innerHighlightsText + description.replace(startsWithHighlightRegex, '');
        }

        return description;
    }
}
