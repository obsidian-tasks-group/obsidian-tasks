import { Status, Task } from '../../Task';
import type { Comparator } from '../Sort';
import { Sorting } from '../Sort';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class StatusField extends FilterInstructionsBasedField {
    constructor() {
        super();

        this._filters.add('done', (task: Task) => task.status === Status.DONE);
        this._filters.add('not done', (task: Task) => task.status !== Status.DONE);
    }

    public fieldName(): string {
        return 'status';
    }

    public createSorter(line: string): Sorting | undefined {
        const sortByRegexp = /^sort by (status)( reverse)?/;
        const fieldMatch = line.match(sortByRegexp);
        if (fieldMatch !== null) {
            const comparator: Comparator = (a: Task, b: Task) => {
                if (a.status < b.status) {
                    return 1;
                } else if (a.status > b.status) {
                    return -1;
                } else {
                    return 0;
                }
            };
            return new Sorting(!!fieldMatch[2], 1, fieldMatch[1], comparator);
        } else {
            return undefined;
        }
    }

    // TODO Eliminate all this duplication!
    public static comparator(): Comparator {
        return (a: Task, b: Task) => {
            if (a.status < b.status) {
                return 1;
            } else if (a.status > b.status) {
                return -1;
            } else {
                return 0;
            }
        };
    }

    public static compare(a: Task, b: Task): -1 | 0 | 1 {
        if (a.status < b.status) {
            return 1;
        } else if (a.status > b.status) {
            return -1;
        } else {
            return 0;
        }
    }
}
