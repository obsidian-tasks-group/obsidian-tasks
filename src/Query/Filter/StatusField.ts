import { Status, Task } from '../../Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';
import { FilterInstruction } from './FilterInstruction';

export class StatusField extends Field {
    private readonly _filters: FilterInstruction[] = [];

    constructor() {
        super();

        this._filters.push(
            new FilterInstruction(
                'done',
                (task: Task) => task.status === Status.Done,
            ),
        );

        this._filters.push(
            new FilterInstruction(
                'not done',
                (task: Task) => task.status !== Status.Done,
            ),
        );
    }

    public canCreateFilterForLine(line: string): boolean {
        for (const filter of this._filters) {
            if (filter.canCreateFilterForLine(line)) {
                return true;
            }
        }
        return false;
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        for (const filter of this._filters) {
            const x = filter.createFilterOrErrorMessage(line);
            if (x.error === undefined) {
                return x;
            }
        }

        const result = new FilterOrErrorMessage();
        result.error = `do not understand filter: ${line}`;
        return result;
    }

    protected fieldName(): string {
        return 'status';
    }

    protected filterRegexp(): RegExp | null {
        return null;
    }
}
