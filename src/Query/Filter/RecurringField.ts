import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class RecurringField extends FilterInstructionsBasedField {
    constructor() {
        super();
        this._filters.add('is recurring', (task) => task.recurrence !== null);
        this._filters.add(
            'is not recurring',
            (task) => task.recurrence === null,
        );
    }

    public fieldName(): string {
        return 'recurring';
    }
}
