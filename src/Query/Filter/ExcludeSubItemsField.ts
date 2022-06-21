import { Field } from './Field';
import type { FilterOrErrorMessage } from './Filter';
import { FilterInstructions } from './FilterInstructions';

/**
 * Implements 'exclude sub-items' filter
 */
export class ExcludeSubItemsField extends Field {
    private readonly _filters = new FilterInstructions();

    constructor() {
        super();

        this._filters.add(
            'exclude sub-items',
            (task) => task.indentation === '',
        );
    }

    public canCreateFilterForLine(line: string): boolean {
        return this._filters.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return this._filters.createFilterOrErrorMessage(line);
    }

    protected fieldName(): string {
        return 'exclude';
    }

    protected filterRegexp(): RegExp | null {
        return null;
    }
}
