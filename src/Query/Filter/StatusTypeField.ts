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
    public canCreateFilterForLine(line: string): boolean {
        // Use a relaxed regexp, just checking field name and not the contents,
        // so that we can parse the line later and give meaningful errors if user uses invalid values.
        const relaxedRegExp = new RegExp(`^(?:${this.fieldNameSingularEscaped()})`);
        return Field.lineMatchesFilter(relaxedRegExp, line);
    }

    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const match = Field.getMatch(this.filterRegExp(), line);
        if (match === null) {
            // It's OK to get here, because canCreateFilterForLine() uses a more relaxed regexp.
            return this.helpMessage(line);
        }

        const [_, filterOperator, statusTypeAsString] = match;

        const statusTypeElement = StatusType[statusTypeAsString.toUpperCase() as keyof typeof StatusType];
        if (!statusTypeElement) {
            return this.helpMessage(line);
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
                return this.helpMessage(line);
        }

        return FilterOrErrorMessage.fromFilter(new Filter(line, filterFunction, new Explanation(line)));
    }

    protected filterRegExp(): RegExp | null {
        return new RegExp(`^(?:${this.fieldNameSingularEscaped()}) (is|is not) ([^ ]+)$`);
    }

    private helpMessage(line: string): FilterOrErrorMessage {
        const allowedTypes = Object.values(StatusType)
            .filter((t) => t !== StatusType.EMPTY)
            .join(' ');

        const message = `Invalid ${this.fieldNameSingular()} instruction: '${line}'.
    Allowed options: 'is' and 'is not' (without quotes).
    Allowed values:  ${allowedTypes}
                     Note: values are case-insensitive,
                           so 'in_progress' works too, for example.
    Example:         ${this.fieldNameSingular()} is not NON_TASK`;
        return FilterOrErrorMessage.fromError(line, message);
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
            const keyA = StatusTypeField.groupName(a);
            const keyB = StatusTypeField.groupName(b);
            return keyA.localeCompare(keyB, undefined, { numeric: true });
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
            return [StatusTypeField.groupName(task)];
        };
    }

    private static groupName(task: Task) {
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
        return prefix + ' ' + task.status.type;
    }
}
