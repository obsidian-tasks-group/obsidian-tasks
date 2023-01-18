import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { StatusType } from '../../StatusConfiguration';
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

    public grouper(): GrouperFunction {
        return (task: Task) => {
            let prefix: string;
            // Add a numeric prefix to sort in to a meaningful order for users
            switch (task.status.type) {
                case StatusType.IN_PROGRESS:
                    prefix = '1';
                    break;
                case StatusType.TODO:
                    prefix = '2';
                    break;
                case StatusType.DONE:
                    prefix = '3';
                    break;
                case StatusType.CANCELLED:
                    prefix = '4';
                    break;
                case StatusType.NON_TASK:
                    prefix = '5';
                    break;
                case StatusType.EMPTY:
                    prefix = '6';
                    break;
            }
            return [prefix + ' ' + task.status.type];
        };
    }
}
