import type moment from 'moment';
import type { Task } from './Task';
import type { Query, SortProperty } from './Query';

type Comparator = (a: Task, b: Task) => number;

export class Sort {
    private static comparatorMap: { [K in SortProperty]: Comparator } = {
        status: this.compareByStatus,
        due: this.compareByDueDate,
        done: this.compareByDoneDate,
        path: this.compareByPath,
        description: this.compareByDescription,
    };

    public static by(query: Pick<Query, 'sorting'>, tasks: Task[]): Task[] {
        let sortedTasks = [...tasks];
        const defaultComparators: Comparator[] = [
            this.compareByPath,
            this.compareByDueDate,
            this.compareByStatus,
        ];

        const userComparators: Comparator[] = [];

        for (const [sortProp, sortDirection] of query.sorting) {
            userComparators.push(
                this.applyDirection(
                    sortDirection,
                    this.comparatorMap[sortProp],
                ),
            );
        }

        const comparators = defaultComparators.concat(userComparators);
        for (const comparator of comparators) {
            sortedTasks = sortedTasks.sort(comparator);
        }

        return sortedTasks;
    }

    private static applyDirection(
        direction: 'asc' | 'desc',
        sortFn: Comparator,
    ): Comparator {
        if (direction === 'desc') {
            return (a: Task, b: Task) => 0 - sortFn(a, b);
        }
        return sortFn;
    }

    private static compareByStatus(a: Task, b: Task): -1 | 0 | 1 {
        if (a.status < b.status) {
            return 1;
        } else if (a.status > b.status) {
            return -1;
        } else {
            return 0;
        }
    }

    private static compareByDueDate(a: Task, b: Task): -1 | 0 | 1 {
        return Sort.compareByDate(a.dueDate, b.dueDate);
    }

    private static compareByDoneDate(a: Task, b: Task): -1 | 0 | 1 {
        return Sort.compareByDate(a.doneDate, b.doneDate);
    }

    private static compareByDate(
        a: moment.Moment | null,
        b: moment.Moment | null,
    ): -1 | 0 | 1 {
        if (a !== null && b === null) {
            return -1;
        } else if (a === null && b !== null) {
            return 1;
        } else if (a !== null && b !== null) {
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

    private static compareByDescription(a: Task, b: Task) {
        return a.description.localeCompare(b.description);
    }
}
