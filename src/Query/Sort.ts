import type { Task } from '../Task';
import type { Comparator } from './Sorter';
import type { Sorter } from './Sorter';
// TODO Remove the cyclic dependency between StatusField and Sort.
import { StatusField } from './Filter/StatusField';
import { DueDateField } from './Filter/DueDateField';
import { PriorityField } from './Filter/PriorityField';
import { PathField } from './Filter/PathField';
import { UrgencyField } from './Filter/UrgencyField';

export class Sort {
    public static by(sorters: Sorter[], tasks: Task[]) {
        // TODO Move code for creating default comparators to separate file
        const defaultComparators: Comparator[] = [
            new UrgencyField().comparator(),
            new StatusField().comparator(),
            new DueDateField().comparator(),
            new PriorityField().comparator(),
            new PathField().comparator(),
        ];

        const userComparators: Comparator[] = [];

        for (const sorter of sorters) {
            userComparators.push(sorter.comparator);
        }

        return tasks.sort(Sort.makeCompositeComparator([...userComparators, ...defaultComparators]));
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
}
