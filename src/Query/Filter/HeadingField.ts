import type { GrouperFunction } from '../Group/Grouper';
import type { Task } from '../../Task/Task';
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

    supportsSorting(): boolean {
        return true;
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            if (task.precedingHeader === null || task.precedingHeader.length === 0) {
                return ['(No heading)'];
            }
            return [task.precedingHeader];
        };
    }
}
