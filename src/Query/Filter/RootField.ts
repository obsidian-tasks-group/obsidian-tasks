import { Group } from '../Group';
import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
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
        return path.substring(0, separatorIndex + 1);
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            const path = task.path.replace(/\\/g, '/');
            const separatorIndex = path.indexOf('/');
            if (separatorIndex == -1) {
                return ['/'];
            }
            return [Group.escapeMarkdownCharacters(path.substring(0, separatorIndex + 1))];
        };
    }
}
