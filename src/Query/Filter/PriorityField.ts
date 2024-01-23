import type { Task } from '../../Task/Task';
import { Explanation } from '../Explain/Explanation';
import type { Comparator } from '../Sort/Sorter';
import type { GrouperFunction } from '../Group/Grouper';
import { Priority } from '../../Task/Priority';
import { Field } from './Field';
import { Filter } from './Filter';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';

export class PriorityField extends Field {
    // The trick in the following to manage whitespace with optional values
    // is to capture them in Nested Capture Groups, like this:
    //  (leading-white-space-in-outer-capture-group(values-to-use-are-in-inner-capture-group))
    // The capture groups are numbered in the order of their opening brackets, from left to right.
    private static readonly priorityRegexp =
        /^priority(\s+is)?(\s+(above|below|not))?(\s+(lowest|low|none|medium|high|highest))$/i;

    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const priorityMatch = Field.getMatch(this.filterRegExp(), line);
        if (priorityMatch !== null) {
            const filterPriorityString = priorityMatch[5];
            let filterPriority: Priority | null = null;

            switch (filterPriorityString.toLowerCase()) {
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
                return FilterOrErrorMessage.fromError(line, 'do not understand priority');
            }

            let explanation = line;
            let filter;
            switch (priorityMatch[3]?.toLowerCase()) {
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

            return FilterOrErrorMessage.fromFilter(new Filter(line, filter, new Explanation(explanation)));
        } else {
            return FilterOrErrorMessage.fromError(line, 'do not understand query filter (priority)');
        }
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
            return [task.priorityNameGroupText];
        };
    }
}
