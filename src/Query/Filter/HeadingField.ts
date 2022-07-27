import type { Task } from '../../Task';
import { TextField } from './TextField';

/** Support the 'heading' search instruction.
 *
 */
export class HeadingField extends TextField {
    protected filterRegexp(): RegExp {
        return /^heading (includes|does not include) (.*)/;
    }

    protected fieldName(): string {
        return 'heading';
    }

    /**
     * Returns the preceding heading, or an empty string if the heading is null
     * @param task
     * @protected
     */
    protected value(task: Task): string {
        if (task.precedingHeader) {
            return task.precedingHeader;
        } else {
            return '';
        }
    }
}
