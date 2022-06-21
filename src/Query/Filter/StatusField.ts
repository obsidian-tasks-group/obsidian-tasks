import { Status, Task } from '../../Task';
import { Field } from './Field';
import type { FilterOrErrorMessage } from './Filter';
import { FilterInstructions } from './FilterInstructions';

export class StatusField extends Field {
    private readonly _filters = new FilterInstructions();

    constructor() {
        super();

        this._filters.add('done', (task: Task) => task.status === Status.Done);
        this._filters.add(
            'not done',
            (task: Task) => task.status !== Status.Done,
        );
    }

    public canCreateFilterForLine(line: string): boolean {
        return this._filters.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return this._filters.createFilterOrErrorMessage(line);
    }

    protected fieldName(): string {
        return 'status';
    }

    protected filterRegexp(): RegExp | null {
        return null;
    }
}
