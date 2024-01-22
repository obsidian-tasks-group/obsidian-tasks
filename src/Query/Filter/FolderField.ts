import type { Task } from '../../Task/Task';
import type { GrouperFunction } from '../Group/Grouper';
import { TextField } from './TextField';

export class FolderField extends TextField {
    public fieldName(): string {
        return 'folder';
    }

    public value(task: Task): string {
        return task.file.folder;
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
