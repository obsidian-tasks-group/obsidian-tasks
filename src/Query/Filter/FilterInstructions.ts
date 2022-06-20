import type { FilterInstruction } from './FilterInstruction';
import { FilterOrErrorMessage } from './Filter';

export class FilterInstructions {
    private readonly _filters: FilterInstruction[] = [];

    public push(filter: FilterInstruction) {
        this._filters.push(filter);
    }

    public canCreateFilterForLine(line: string): boolean {
        for (const filter of this._filters) {
            if (filter.canCreateFilterForLine(line)) {
                return true;
            }
        }
        return false;
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        for (const filter of this._filters) {
            const x = filter.createFilterOrErrorMessage(line);
            if (x.error === undefined) {
                return x;
            }
        }

        const result = new FilterOrErrorMessage();
        result.error = `do not understand filter: ${line}`;
        return result;
    }
}
