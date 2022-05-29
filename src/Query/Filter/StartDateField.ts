import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateField } from './DateField';

/**
 * Support the 'starts' search instruction.
 */
export class StartDateField extends DateField {
    private static readonly startRegexp = /^starts (before|after|on)? ?(.*)/;

    protected filterRegexp(): RegExp {
        return StartDateField.startRegexp;
    }
    protected fieldName(): string {
        return 'start';
    }
    protected date(task: Task): Moment | null {
        return task.startDate;
    }
    protected filterResultIfFieldMissing() {
        // reference: https://schemar.github.io/obsidian-tasks/queries/filters/#start-date
        return true;
    }
}
