import type { Sorter } from '../../src/Query/Sorter';
import type { Task } from '../../src/Task';
import { Sort } from '../../src/Query/Sort';

export function sortBy(sorters: Sorter[], tasks: Task[]) {
    return Sort.by(sorters, tasks);
}
