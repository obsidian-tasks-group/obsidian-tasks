import type { Task } from '../../Task';
import { TextField } from './TextField';

/**
 * A ${@link Field} implementation for searching status.type
 */
export class StatusTypeField extends TextField {
    constructor() {
        super();
    }

    public fieldName(): string {
        return 'status.type';
    }

    value(task: Task): string {
        return task.status.type;
    }

    supportsSorting(): boolean {
        return true;
    }

    public supportsGrouping(): boolean {
        return true;
    }
}
