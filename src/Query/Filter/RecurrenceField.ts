import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { TextField } from './TextField';

export class RecurrenceField extends TextField {
    fieldName(): string {
        return 'recurrence';
    }

    value(task: Task): string {
        if (task.recurrence !== null) {
            return task.recurrence!.toText();
        } else {
            return '';
        }
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            if (task.recurrence !== null) {
                return [task.recurrence!.toText()];
            } else {
                return ['None'];
            }
        };
    }
}
