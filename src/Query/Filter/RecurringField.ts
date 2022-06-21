import { Field } from './Field';
import type { FilterOrErrorMessage } from './Filter';
import { FilterInstructions } from './FilterInstructions';

export class RecurringField extends Field {
    private readonly _filters = new FilterInstructions();

    constructor() {
        super();
        this._filters.add('is recurring', (task) => task.recurrence !== null);
        this._filters.add(
            'is not recurring',
            (task) => task.recurrence === null,
        );
    }

    public canCreateFilterForLine(line: string): boolean {
        return this._filters.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return this._filters.createFilterOrErrorMessage(line);
    }

    protected fieldName(): string {
        return 'recurring';
    }

    protected filterRegexp(): RegExp | null {
        return null;
    }
}
