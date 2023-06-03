import { Priority, Task } from '../../Task';
import { Explanation } from '../Explain/Explanation';
import type { Comparator } from '../Sorter';
import type { GrouperFunction } from '../Grouper';
import { Field } from './Field';
import { Filter, FilterOrErrorMessage } from './Filter';

export class PriorityField extends Field {
    // The trick in the following to manage whitespace with optional values
    // is to capture them in Nested Capture Groups, like this:
    //  (leading-white-space-in-outer-capture-group(values-to-use-are-in-inner-capture-group))
    // The capture groups are numbered in the order of their opening brackets, from left to right.
    private static readonly priorityRegexp =
        /^priority(\s+is)?(\s+(above|below|not))?(\s+(lowest|low|none|medium|high|highest))$/;

    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage(line);
        const priorityMatch = Field.getMatch(this.filterRegExp(), line);
        if (priorityMatch !== null) {
            const filterPriorityString = priorityMatch[5];
            let filterPriority: Priority | null = null;

            switch (filterPriorityString) {
                case 'lowest':
                    filterPriority = Priority.Lowest;
                    break;
                case 'low':
                    filterPriority = Priority.Low;
                    break;
                case 'none':
                    filterPriority = Priority.None;
                    break;
                case 'medium':
                    filterPriority = Priority.Medium;
                    break;
                case 'high':
                    filterPriority = Priority.High;
                    break;
                case 'highest':
                    filterPriority = Priority.Highest;
                    break;
            }

            if (filterPriority === null) {
                result.error = 'do not understand priority';
                return result;
            }

            let explanation = line;
            let filter;
            switch (priorityMatch[3]) {
                case 'above':
                    filter = (task: Task) => task.priority.localeCompare(filterPriority!) < 0;
                    break;
                case 'below':
                    filter = (task: Task) => task.priority.localeCompare(filterPriority!) > 0;
                    break;
                case 'not':
                    filter = (task: Task) => task.priority !== filterPriority;
                    break;
                default:
                    filter = (task: Task) => task.priority === filterPriority;
                    explanation = `${this.fieldName()} is ${filterPriorityString}`;
            }

            result.filter = new Filter(line, filter, new Explanation(explanation));
        } else {
            result.error = 'do not understand query filter (priority)';
        }
        return result;
    }

    public fieldName(): string {
        return 'priority';
    }

    protected filterRegExp(): RegExp {
        return PriorityField.priorityRegexp;
    }

    public supportsSorting(): boolean {
        return true;
    }

    public comparator(): Comparator {
        return (a: Task, b: Task) => {
            return a.priority.localeCompare(b.priority);
        };
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            const priorityName = PriorityField.priorityNameUsingNone(task.priority);
            return [`Priority ${task.priority}: ${priorityName}`];
        };
    }

    /**
     * Get the name of a {@link Priority} value, returning 'None' for {@link Priority.None}
     * @param priority
     * @see priorityNameUsingNormal
     */
    public static priorityNameUsingNone(priority: Priority) {
        let priorityName = 'ERROR';
        switch (priority) {
            case Priority.High:
                priorityName = 'High';
                break;
            case Priority.Highest:
                priorityName = 'Highest';
                break;
            case Priority.Medium:
                priorityName = 'Medium';
                break;
            case Priority.None:
                priorityName = 'None';
                break;
            case Priority.Low:
                priorityName = 'Low';
                break;
            case Priority.Lowest:
                priorityName = 'Lowest';
                break;
        }
        return priorityName;
    }

    /**
     * Get the name of a {@link Priority} value, returning 'Normal' for {@link Priority.None}
     * @param priority
     * @see priorityNameUsingNone
     */
    public static priorityNameUsingNormal(priority: Priority) {
        return PriorityField.priorityNameUsingNone(priority).replace('None', 'Normal');
    }
}
