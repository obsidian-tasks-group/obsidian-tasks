import type { Task } from '../../Task/Task';
import type { GrouperFunction } from '../Group/Grouper';
import { TextField } from './TextField';

/** Support the 'filename' search instruction.
 *
 * Note that the current implementation also searches the file extension,
 * so 'filename includes .md' will typically match all tasks.
 *
 */
export class FilenameField extends TextField {
    public fieldName(): string {
        return 'filename';
    }

    /**
     * Returns the file name including file extension, or an empty string if the task does not have a filename
     * @param task
     * @public
     */
    public value(task: Task): string {
        const filename = task.filename;
        if (filename === null) {
            return '';
        }
        return filename + '.md';
    }

    supportsSorting(): boolean {
        return true;
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            // Note current limitation: Tasks from different notes with the
            // same name will be grouped together, even though they are in
            // different files and their links will look different.
            const filename = task.filename;
            if (filename === null) {
                return ['Unknown Location'];
            }
            return ['[[' + filename + ']]'];
        };
    }
}
