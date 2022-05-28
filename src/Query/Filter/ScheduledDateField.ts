import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateField } from './DateField';

/**
 * Support the 'scheduled' search instruction.
 */
export class ScheduledDateField extends DateField {
    private static readonly scheduledRegexp =
        /^scheduled (before|after|on)? ?(.*)/;

    protected filterRegexp(): RegExp {
        return ScheduledDateField.scheduledRegexp;
    }
    protected fieldName(): string {
        return 'scheduled';
    }
    protected date(task: Task): Moment | null {
        return task.scheduledDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }
}
