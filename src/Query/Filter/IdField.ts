import { Field } from './Field';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

export class IdField extends Field {
    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return FilterOrErrorMessage.fromError(line, 'Not yet implemented');
    }

    public fieldName(): string {
        return 'id';
    }

    protected filterRegExp(): RegExp | null {
        return null;
    }
}
