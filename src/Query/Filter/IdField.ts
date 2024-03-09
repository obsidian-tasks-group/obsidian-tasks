import type { Task } from '../../Task/Task';
import type { FilterOrErrorMessage } from './FilterOrErrorMessage';
import { FilterInstructions } from './FilterInstructions';
import { TextField } from './TextField';

export class IdField extends TextField {
    private readonly filterInstructions: FilterInstructions = new FilterInstructions();

    constructor() {
        super();
        this.filterInstructions.add('has id', (task: Task) => task.id.length > 0);
        this.filterInstructions.add('no id', (task: Task) => task.id.length === 0);
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

        return super.createFilterOrErrorMessage(line);
    }

    public fieldName(): string {
        return 'id';
    }

    public value(task: Task): string {
        return task.id;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    public supportsSorting(): boolean {
        return true;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    public supportsGrouping(): boolean {
        return true;
    }
}
