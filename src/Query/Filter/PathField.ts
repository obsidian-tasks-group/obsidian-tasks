import type { Task } from '../../Task';
import type { Comparator } from '../Sorting';
import { TextField } from './TextField';

/** Support the 'path' search instruction.
 *
 * Note that the current implementation also searches the file extension,
 * so 'path includes .md' will typically match all tasks.
 *
 */
export class PathField extends TextField {
    public fieldName(): string {
        return 'path';
    }

    /**
     * Returns the file path including file extension, or an empty string if the path is null
     * @param task
     * @public
     */
    public value(task: Task): string {
        return task.path;
    }

    public supportsSorting(): boolean {
        return true;
    }

    /**
     * Return a function to compare two Task objects, for use in sorting by description.
     */
    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            if (a.path < b.path) {
                return -1;
            } else if (a.path > b.path) {
                return 1;
            } else {
                return 0;
            }
        };
    }
}
