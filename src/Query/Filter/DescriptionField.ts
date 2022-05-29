import { getSettings } from '../../Settings';
import type { Task } from '../../Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';
import { TextField } from './TextField';

export class DescriptionField extends Field {
    private static readonly descriptionRegexp =
        /^description (includes|does not include) (.*)/;

    createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        const descriptionMatch = line.match(DescriptionField.descriptionRegexp);
        if (descriptionMatch !== null) {
            const filterMethod = descriptionMatch[1];
            const globalFilter = getSettings().globalFilter;

            if (filterMethod === 'includes') {
                result.filter = (task: Task) =>
                    TextField.stringIncludesCaseInsensitive(
                        // Remove global filter from description match if present.
                        // This is necessary to match only on the content of the task, not
                        // the global filter.
                        task.description.replace(globalFilter, '').trim(),
                        descriptionMatch[2],
                    );
            } else if (descriptionMatch[1] === 'does not include') {
                result.filter = (task: Task) =>
                    !TextField.stringIncludesCaseInsensitive(
                        // Remove global filter from description match if present.
                        // This is necessary to match only on the content of the task, not
                        // the global filter.
                        task.description.replace(globalFilter, '').trim(),
                        descriptionMatch[2],
                    );
            } else {
                result.error = 'do not understand query filter (description)';
            }
        } else {
            result.error = 'do not understand query filter (description)';
        }
        return result;
    }

    protected fieldName(): string {
        return 'description';
    }

    protected filterRegexp(): RegExp {
        return DescriptionField.descriptionRegexp;
    }
}
