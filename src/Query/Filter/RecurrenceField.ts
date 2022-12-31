import type { Task } from '../../Task';
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
}
