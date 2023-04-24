import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { TextField } from './TextField';

export class FolderField extends TextField {
    public fieldName(): string {
        return 'folder';
    }

    public value(task: Task): string {
        const path = task.path;
        const fileNameWithExtension = task.filename + '.md';
        const folder = path.substring(0, path.lastIndexOf(fileNameWithExtension));
        if (folder === '') {
            return '/';
        }
        return folder;
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            return [TextField.escapeMarkdownCharacters(this.value(task))];
        };
    }
}
