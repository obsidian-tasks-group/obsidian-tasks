import type { Moment } from 'moment';
import type { Task } from '../../Task/Task';
import { DateField } from './DateField';

/**
 * Support the 'starts' search instruction.
 */
export class StartDateField extends DateField {
    public fieldName(): string {
        return 'start';
    }
    protected fieldNameForFilterInstruction(): string {
        return 'starts';
    }
    public date(task: Task): Moment | null {
        return task.startDate;
    }
    protected filterResultIfFieldMissing() {
        // reference: https://publish.obsidian.md/tasks/Queries/Filters#Start+Date
        return true;
    }
}
