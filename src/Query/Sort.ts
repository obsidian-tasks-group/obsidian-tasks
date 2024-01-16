import type { Task } from '../Task';
import type { Comparator } from './Sorter';
import type { Sorter } from './Sorter';
import { StatusField } from './Filter/StatusField';
import { DueDateField } from './Filter/DueDateField';
import { PriorityField } from './Filter/PriorityField';
import { PathField } from './Filter/PathField';
import { UrgencyField } from './Filter/UrgencyField';
import type { SearchInfo } from './SearchInfo';

type PlainComparator = (a: Task, b: Task) => number;

export class Sort {
    public static by(sorters: Sorter[], tasks: Task[], searchInfo: SearchInfo) {
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

        return tasks.sort(Sort.makeCompositeComparator([...userComparators, ...defaultComparators], searchInfo));
    }

    private static makeCompositeComparator(comparators: Comparator[], searchInfo: SearchInfo): PlainComparator {
        return (a, b) => {
            for (const comparator of comparators) {
                const result = comparator(a, b, searchInfo);
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        };
    }
}
