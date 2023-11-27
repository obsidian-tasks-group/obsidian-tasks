import { Field } from './Field';
import { FilterInstructions } from './FilterInstructions';
import type { FilterOrErrorMessage } from './FilterOrErrorMessage';

/**
 * This class is an implementation for implements of {@link Field}
 *
 * The named of the class is weak. It is based solely on the fact that the
 * class is entirely implemented via the {@link FilterInstructions} class.
 */
export abstract class FilterInstructionsBasedField extends Field {
    protected readonly _filters = new FilterInstructions();

    public canCreateFilterForLine(line: string): boolean {
        return this._filters.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return this._filters.createFilterOrErrorMessage(line);
    }

    protected filterRegExp(): RegExp | null {
        return null;
    }
}
