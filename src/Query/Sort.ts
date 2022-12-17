import type { Task } from '../Task';
import { Sorting } from './Sorting';
import type { Comparator } from './Sorting';
import type { Query, SortingProperty } from './Query';
// TODO Remove the cyclic dependency between StatusField and Sort.
import { StatusField } from './Filter/StatusField';
import { DueDateField } from './Filter/DueDateField';
import { PriorityField } from './Filter/PriorityField';
import { PathField } from './Filter/PathField';
import { UrgencyField } from './Filter/UrgencyField';

export class Sort {
    static tagPropertyInstance: number = 1;

    public static by(query: Pick<Query, 'sorting'>, tasks: Task[]): Task[] {
        // TODO Move code for creating default comparators to separate file
        const defaultComparators: Comparator[] = [
            new UrgencyField().comparator(),
            new StatusField().comparator(),
            new DueDateField().comparator(),
            new PriorityField().comparator(),
            new PathField().comparator(),
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
        tag: Sort.compareByTag,
    };

    /**
     * Legacy function, for creating a Sorting object for a SortingProperty type.
     *
     * TODO Once SortingProperty in Query.ts has been removed, remove this method.
     * @param reverse - whether the sort order should be reversed.
     * @param propertyInstance - for tag sorting, this is a 1-based index for the tag number in the task to sort by.
     *                           TODO eventually, move this number to the comparator used for sorting by tag.
     * @param property - the name of the property. This string must match
     *                   one of the values in ${@link SortingProperty}.
     */
    public static makeLegacySorting(reverse: boolean, propertyInstance: number, property: SortingProperty): Sorting {
        const comparator = Sort.makeLegacyComparator(property);
        return new Sorting(reverse, propertyInstance, property, comparator);
    }

    /**
     * Legacy function, for creating a Comparator function for a SortingProperty type.
     *
     * TODO Once SortingProperty in Query.ts has been removed, remove this method.
     * @param property - the name of the property. This string must match
     *                   one of the values in ${@link SortingProperty}.
     *                   Throws if property not recognised.
     */
    public static makeLegacyComparator(property: SortingProperty): Comparator {
        const comparator = Sort.comparators[property];
        if (!comparator) {
            throw Error('Unrecognised legacy sort keyword: ' + property);
        }
        return comparator;
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
}
