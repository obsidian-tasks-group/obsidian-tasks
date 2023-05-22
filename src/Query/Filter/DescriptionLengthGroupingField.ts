import type { Task } from 'Task';
import type { GrouperFunction } from 'Query/Grouper';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

/** This is a class for test purposes of a Field that supports grouping but not sorting
 */
export class DescriptionLengthGroupingfield extends Field {
    protected filterRegExp(): RegExp | null {
        throw new Error('No filtering for description length field');
    }
    public fieldName(): string {
        return 'description length';
    }

    public value(task: Task): number {
        return task.description.length;
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return FilterOrErrorMessage.fromError(line, 'description length field does not support filtering');
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    // Doesn't support sorting by default as in Field.ts

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            return [this.value(task).toString()];
        };
    }
}
