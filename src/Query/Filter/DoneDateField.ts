import type { Moment } from 'moment';
import type { Task } from '../../Task';
import { DateField } from './DateField';
import { FilterOrErrorMessage } from './Filter';

/**
 * Support the 'done' search instruction.
 */
export class DoneDateField extends DateField {
    private static readonly doneRegexp = /^done (before|after|on)? ?(.*)/;
    private static readonly instructionForFieldPresence = 'has done date';
    private static readonly instructionForFieldAbsence = 'no done date';

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        if (line === DoneDateField.instructionForFieldPresence) {
            const result = new FilterOrErrorMessage();
            result.filter = (task: Task) => this.date(task) !== null;
            return result;
        }

        if (line === DoneDateField.instructionForFieldAbsence) {
            const result = new FilterOrErrorMessage();
            result.filter = (task: Task) => this.date(task) === null;
            return result;
        }

        return super.createFilterOrErrorMessage(line);
    }

    protected filterRegexp(): RegExp {
        return DoneDateField.doneRegexp;
    }
    protected fieldName(): string {
        return 'done';
    }
    protected date(task: Task): Moment | null {
        return task.doneDate;
    }
    protected filterResultIfFieldMissing() {
        return false;
    }
}
