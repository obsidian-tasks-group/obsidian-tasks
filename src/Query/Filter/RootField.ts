import type { Task } from '../../Task/Task';
import type { GrouperFunction } from '../Group/Grouper';
import { TextField } from './TextField';

export class RootField extends TextField {
    public fieldName(): string {
        return 'root';
    }

    public value(task: Task): string {
        return task.file.root;
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
