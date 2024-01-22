import type { Task } from '../../Task/Task';
import { StatusTypeField } from '../Filter/StatusTypeField';
import { DueDateField } from '../Filter/DueDateField';
import { PriorityField } from '../Filter/PriorityField';
import { PathField } from '../Filter/PathField';
import { UrgencyField } from '../Filter/UrgencyField';
import type { SearchInfo } from '../SearchInfo';
import type { Comparator, Sorter } from './Sorter';

type PlainComparator = (a: Task, b: Task) => number;

export class Sort {
    public static by(sorters: Sorter[], tasks: Task[], searchInfo: SearchInfo) {
        const defaultComparators: Comparator[] = this.defaultSorters().map((sorter) => sorter.comparator);

        const userComparators: Comparator[] = [];

        for (const sorter of sorters) {
            userComparators.push(sorter.comparator);
        }

        return tasks.sort(Sort.makeCompositeComparator([...userComparators, ...defaultComparators], searchInfo));
    }

    public static defaultSorters() {
        return [
            new StatusTypeField().createNormalSorter(),
            new UrgencyField().createNormalSorter(),
            new DueDateField().createNormalSorter(),
            new PriorityField().createNormalSorter(),
            new PathField().createNormalSorter(),
        ];
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
