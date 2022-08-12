import type { Task } from '../../Task';
import { TextField } from './TextField';

/** Support the 'path' search instruction.
 *
 * Note that the current implementation also searches the file extension,
 * so 'path includes .md' will typically match all tasks.
 *
 */
export class PathField extends TextField {
    protected fieldName(): string {
        return 'path';
    }

    /**
     * Returns the file path including file extension, or an empty string if the path is null
     * @param task
     * @protected
     */
    protected value(task: Task): string {
        return task.path;
    }
}
