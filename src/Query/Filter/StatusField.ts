import { Status } from '../../Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

export class StatusField extends Field {
    private readonly instructionForFieldPresence = 'done';
    private readonly instructionForFieldAbsence = 'not done';

    public canCreateFilterForLine(line: string): boolean {
        return (
            line === this.instructionForFieldAbsence ||
            line === this.instructionForFieldPresence
        );
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();

        if (line === this.instructionForFieldPresence) {
            result.filter = (task) => task.status === Status.Done;
            return result;
        }

        if (line === this.instructionForFieldAbsence) {
            result.filter = (task) => task.status !== Status.Done;
            return result;
        }

        result.error = `do not understand filter: ${line}`;

        return result;
    }

    protected fieldName(): string {
        return 'status';
    }

    protected filterRegexp(): RegExp {
        // TODO Consider throwing - or making the method optional???
        return RegExp('NO SUCH FIELD');
    }
}
