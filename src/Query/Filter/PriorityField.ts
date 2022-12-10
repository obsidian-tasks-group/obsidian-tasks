import { Priority, Task } from '../../Task';
import { Explanation } from '../Explain/Explanation';
import { Field } from './Field';
import { Filter, FilterOrErrorMessage } from './Filter';

export class PriorityField extends Field {
    // The trick in the following to manage whitespace with optional values
    // is to capture them in Nested Capture Groups, like this:
    //  (leading-white-space-in-outer-capture-group(values-to-use-are-in-inner-capture-group))
    // The capture groups are numbered in the order of their opening brackets, from left to right.
    private static readonly priorityRegexp = /^priority(\s+is)?(\s+(above|below|not))?(\s+(low|none|medium|high))$/;

    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage(line);
        const priorityMatch = Field.getMatch(this.filterRegExp(), line);
        if (priorityMatch !== null) {
            const filterPriorityString = priorityMatch[5];
            let filterPriority: Priority | null = null;

            switch (filterPriorityString) {
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
}
