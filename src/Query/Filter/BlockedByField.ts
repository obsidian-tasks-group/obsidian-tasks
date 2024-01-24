import type { Task } from '../../Task/Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';
import { FilterInstructions } from './FilterInstructions';

export class BlockedByField extends Field {
    private readonly filterInstructions: FilterInstructions = new FilterInstructions();

    constructor() {
        super();
        this.filterInstructions.add('has blocked by', (task: Task) => task.blockedBy.length > 0);
        this.filterInstructions.add('no blocked by', (task: Task) => task.blockedBy.length === 0);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Filtering
    // -----------------------------------------------------------------------------------------------------------------

    public canCreateFilterForLine(line: string): boolean {
        if (this.filterInstructions.canCreateFilterForLine(line)) {
            return true;
        }

        return super.canCreateFilterForLine(line);
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const filterResult = this.filterInstructions.createFilterOrErrorMessage(line);
        if (filterResult.filter !== undefined) {
            return filterResult;
        }

        return FilterOrErrorMessage.fromError(line, 'Unknown instruction');
    }

    public fieldName(): string {
        return 'blocked by';
    }

    protected filterRegExp(): RegExp | null {
        return null;
    }
}
