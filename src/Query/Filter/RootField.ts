import { Group } from '../Group';
import type { Task } from '../../Task';
import { TextField } from './TextField';

export class RootField extends TextField {
    public fieldName(): string {
        return 'root';
    }

    public value(task: Task): string {
        const path = task.path.replace(/\\/g, '/');
        const separatorIndex = path.indexOf('/');
        if (separatorIndex == -1) {
            return '/';
        }
        return Group.escapeMarkdownCharacters(path.substring(0, separatorIndex + 1));
    }

    public supportsGrouping(): boolean {
        return true;
    }
}
