import type { Sorter } from 'Query/Sort/Sorter';
import type { Task } from 'Task/Task';
import { Sort } from 'Query/Sort/Sort';
import { SearchInfo } from 'Query/SearchInfo';

export function sortBy(sorters: Sorter[], tasks: Task[]) {
    return Sort.by(sorters, tasks, SearchInfo.fromAllTasks(tasks));
}
