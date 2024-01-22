import type { Task } from '../../Task/Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';
import { FilterInstructions } from './FilterInstructions';

export class IdField extends Field {
    private readonly filterInstructions: FilterInstructions = new FilterInstructions();

    constructor() {
        super();
        this.filterInstructions.add('has id', (task: Task) => task.id.length > 0);
        this.filterInstructions.add('no id', (task: Task) => task.id.length === 0);
    }

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
        return 'id';
    }

    protected filterRegExp(): RegExp | null {
        return null;
    }
}
