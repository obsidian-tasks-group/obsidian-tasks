import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

export class RecurringField extends Field {
    private readonly instructionForFieldPresence = 'is recurring';
    private readonly instructionForFieldAbsence = 'is not recurring';

    public canCreateFilterForLine(line: string): boolean {
        return (
            line === this.instructionForFieldAbsence ||
            line === this.instructionForFieldPresence
        );
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();

        if (line === this.instructionForFieldPresence) {
            result.filter = (task) => task.recurrence !== null;
            return result;
        }

        if (line === this.instructionForFieldAbsence) {
            result.filter = (task) => task.recurrence === null;
            return result;
        }

        result.error = `do not understand filter: ${line}`;

        return result;
    }

    protected fieldName(): string {
        return 'recurring';
    }

    protected filterRegexp(): RegExp | null {
        return null;
    }
}
