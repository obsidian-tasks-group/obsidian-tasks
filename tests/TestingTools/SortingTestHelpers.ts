import type { Sorter } from '../../src/Query/Sort/Sorter';
import type { Task } from '../../src/Task/Task';
import { Sort } from '../../src/Query/Sort/Sort';
import { SearchInfo } from '../../src/Query/SearchInfo';

export function sortBy(sorters: Sorter[], tasks: Task[]) {
    return Sort.by(sorters, tasks, SearchInfo.fromAllTasks(tasks));
}
