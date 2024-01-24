import { Field } from './Field';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

export class BlockedByField extends Field {
    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return FilterOrErrorMessage.fromError(line, 'Filtering blocked by not yet implemented');
    }

    public fieldName(): string {
        return 'blocked by';
    }

    protected filterRegExp(): RegExp | null {
        return null;
    }
}
