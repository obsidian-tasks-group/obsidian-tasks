import type { Task } from '../../Task';
import { TextField } from './TextField';

/** Support the 'heading' search instruction.
 *
 */
export class HeadingField extends TextField {
    public fieldName(): string {
        return 'heading';
    }

    /**
     * Returns the preceding heading, or an empty string if the heading is null
     * @param task
     * @public
     */
    public value(task: Task): string {
        if (task.precedingHeader) {
            return task.precedingHeader;
        } else {
            return '';
        }
    }
}
