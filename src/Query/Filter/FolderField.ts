import { Group } from '../Group';
import type { Task } from '../../Task';
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
        return Group.escapeMarkdownCharacters(folder);
    }

    public supportsGrouping(): boolean {
        return true;
    }
}
