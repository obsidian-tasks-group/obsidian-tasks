import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

/**
 * Implements 'exclude sub-items' filter
 */
export class ExcludeSubItemsField extends FilterInstructionsBasedField {
    constructor() {
        super();

        this._filters.add(
            'exclude sub-items',
            (task) => task.indentation === '',
        );
    }

    protected fieldName(): string {
        return 'exclude';
    }
}
