import type { Task } from '../../Task';
import { TextField } from './TextField';

/**
 * A ${@link Field} implementation for searching status.name
 */
export class StatusNameField extends TextField {
    constructor() {
        super();
    }

    public fieldName(): string {
        return 'status.name';
    }

    value(task: Task): string {
        return task.status.name;
    }
}
