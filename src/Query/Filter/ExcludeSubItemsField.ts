import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

/**
 * Implements 'exclude sub-items' filter
 */
export class ExcludeSubItemsField extends FilterInstructionsBasedField {
    constructor() {
        super();

        this._filters.add('exclude sub-items', (task) => {
            if (task.indentation === '') return true; // no indentation, not a subitem

            const lastBlockquoteMark = task.indentation.lastIndexOf('>');
            if (lastBlockquoteMark === -1) return false; // indentation present, not in a blockquote, subitem

            // Up to one space allowed after last > in blockquote/callout, otherwise subitem
            return /^ ?$/.test(task.indentation.slice(lastBlockquoteMark + 1));
        });
    }

    public fieldName(): string {
        return 'exclude';
    }
}
