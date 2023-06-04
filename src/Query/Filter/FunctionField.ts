import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

export class FunctionField extends Field {
    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return FilterOrErrorMessage.fromError(line, 'Searching by custom function not yet implemented');
    }

    fieldName(): string {
        return '';
    }

    protected filterRegExp(): RegExp | null {
        return null;
    }
}
