import { Query } from '../../Query';
import type { Task } from '../../Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';

export class PathField extends Field {
    private static readonly pathRegexp =
        /^path (includes|does not include) (.*)/;

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        const pathMatch = line.match(PathField.pathRegexp);
        if (pathMatch !== null) {
            const filterMethod = pathMatch[1];
            if (filterMethod === 'includes') {
                result.filter = (task: Task) =>
                    Query.stringIncludesCaseInsensitive(
                        task.path,
                        pathMatch[2],
                    );
            } else if (pathMatch[1] === 'does not include') {
                result.filter = (task: Task) =>
                    !Query.stringIncludesCaseInsensitive(
                        task.path,
                        pathMatch[2],
                    );
            } else {
                result.error = 'do not understand query filter (path)';
            }
        } else {
            result.error = 'do not understand query filter (path)';
        }
        return result;
    }

    protected filterRegexp(): RegExp {
        return PathField.pathRegexp;
    }

    protected fieldName(): string {
        return 'path';
    }
}
