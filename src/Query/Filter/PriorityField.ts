import { Priority, Task } from '../../Task';
import { Explanation } from '../Explain/Explanation';
import { Field } from './Field';
import { Filter, FilterOrErrorMessage } from './Filter';

export class PriorityField extends Field {
    private static readonly priorityRegexp = /^priority (is )?(above|below)? ?(low|none|medium|high)/;

    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage(line);
        const priorityMatch = Field.getMatch(this.filterRegExp(), line);
        if (priorityMatch !== null) {
            const filterPriorityString = priorityMatch[3];
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
            if (priorityMatch[2] === 'above') {
                filter = (task: Task) => (task.priority ? task.priority.localeCompare(filterPriority!) < 0 : false);
            } else if (priorityMatch[2] === 'below') {
                filter = (task: Task) => (task.priority ? task.priority.localeCompare(filterPriority!) > 0 : false);
            } else {
                filter = (task: Task) => (task.priority ? task.priority === filterPriority : false);
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
