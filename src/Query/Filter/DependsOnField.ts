import type { Task } from '../../Task/Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';
import { FilterInstructions } from './FilterInstructions';

export class DependsOnField extends Field {
    private readonly filterInstructions: FilterInstructions = new FilterInstructions();

    constructor() {
        super();
        this.filterInstructions.add('has depends on', (task: Task) => task.dependsOn.length > 0);
        this.filterInstructions.add('no depends on', (task: Task) => task.dependsOn.length === 0);
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
        if (filterResult.isValid()) {
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
