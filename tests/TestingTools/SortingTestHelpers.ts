import type { Sorter } from '../../src/Query/Sorter';
import type { Task } from '../../src/Task';
import { Sort } from '../../src/Query/Sort';
import { SearchInfo } from '../../src/Query/SearchInfo';

export function sortBy(sorters: Sorter[], tasks: Task[]) {
    return Sort.by(sorters, tasks, SearchInfo.fromAllTasks(tasks));
}
