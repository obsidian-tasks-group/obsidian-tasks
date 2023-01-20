import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { StatusType } from '../../StatusConfiguration';
import type { Comparator } from '../Sorter';
import { Explanation } from '../Explain/Explanation';
import { Field } from './Field';
import { Filter, FilterOrErrorMessage } from './Filter';
import type { FilterFunction } from './Filter';

/**
 * A ${@link Field} implementation for searching status.type
 */
export class StatusTypeField extends Field {
    // -----------------------------------------------------------------------------------------------------------------
    // Filtering
    // -----------------------------------------------------------------------------------------------------------------

    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const match = Field.getMatch(this.filterRegExp(), line);
        if (match === null) {
            // If Field.canCreateFilterForLine() has been checked, we should never get
            // in to this block.
            return StatusTypeField.helpMessage(line);
        }

        const [_, filterOperator, statusTypeAsString] = match;

        const statusTypeElement = StatusType[statusTypeAsString as keyof typeof StatusType];
        if (!statusTypeElement) {
            return StatusTypeField.helpMessage(line);
        }

        let filterFunction: FilterFunction;

        switch (filterOperator) {
            case 'is':
                filterFunction = (task: Task) => {
                    return task.status.type === statusTypeElement;
                };
                break;
            case 'is not':
                filterFunction = (task: Task) => {
                    return task.status.type !== statusTypeElement;
                };
                break;
            default:
                return StatusTypeField.helpMessage(line);
        }

        return FilterOrErrorMessage.fromFilter(new Filter(line, filterFunction, new Explanation(line)));
    }

    protected filterRegExp(): RegExp | null {
        return new RegExp(`^(?:${this.fieldNameSingularEscaped()}) (is|is not) ([^ ]+)$`);
    }

    public static helpMessage(line: string): FilterOrErrorMessage {
        // TODO I'd like to provide a help message that lists the valid statuses
        return FilterOrErrorMessage.fromError(line, 'do not understand filter');
    }

    public fieldName(): string {
        return 'status.type';
    }

    value(task: Task): string {
        return task.status.type;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Sorting
    // -----------------------------------------------------------------------------------------------------------------

    supportsSorting(): boolean {
        return true;
    }

    comparator(): Comparator {
        return (a: Task, b: Task) => {
            return this.value(a).localeCompare(this.value(b), undefined, { numeric: true });
        };
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Grouping
    // -----------------------------------------------------------------------------------------------------------------

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            let prefix: string;
            // Add a numeric prefix to sort in to a meaningful order for users
            switch (task.status.type) {
                case StatusType.IN_PROGRESS:
                    prefix = '1';
                    break;
                case StatusType.TODO:
                    prefix = '2';
                    break;
                case StatusType.DONE:
                    prefix = '3';
                    break;
                case StatusType.CANCELLED:
                    prefix = '4';
                    break;
                case StatusType.NON_TASK:
                    prefix = '5';
                    break;
                case StatusType.EMPTY:
                    prefix = '6';
                    break;
            }
            return [prefix + ' ' + task.status.type];
        };
    }
}
