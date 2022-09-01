import { Status, Task } from '../../Task';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class StatusField extends FilterInstructionsBasedField {
    constructor() {
        super();

        this._filters.add('done', (task: Task) => task.status === Status.Done);
        this._filters.add(
            'not done',
            (task: Task) => task.status !== Status.Done,
        );
    }

    public fieldName(): string {
        return 'status';
    }
}
