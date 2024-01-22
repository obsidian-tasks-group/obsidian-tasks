import type { Task } from '../../Task/Task';
import type { GrouperFunction } from '../Group/Grouper';
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

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            // Does this need to be made stricter?
            // Is there a better way of getting the file name?
            return [TextField.escapeMarkdownCharacters(task.path.replace('.md', ''))];
        };
    }
}
