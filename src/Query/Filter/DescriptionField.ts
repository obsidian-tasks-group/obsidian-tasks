import { getSettings } from '../../config/Settings';
import type { Task } from '../../Task';
import { TextField } from './TextField';

/**
 * Support the 'description' search instruction.
 *
 * Note that DescriptionField.value() returns the description
 * with the global filter (if any) removed.
 */
export class DescriptionField extends TextField {
    protected fieldName(): string {
        return 'description';
    }

    /**
     * Return the task's description, with any global tag removed
     * @param task
     * @protected
     */
    protected value(task: Task): string {
        // Remove global filter from description match if present.
        // This is necessary to match only on the content of the task, not
        // the global filter.
        const globalFilter = getSettings().globalFilter;
        return task.description.replace(globalFilter, '').trim();
    }
}
