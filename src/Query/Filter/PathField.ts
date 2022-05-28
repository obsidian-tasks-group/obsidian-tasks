import type { Task } from '../../Task';
import { TextField } from './TextField';

export class PathField extends TextField {
    private static readonly pathRegexp =
        /^path (includes|does not include) (.*)/;

    protected filterRegexp(): RegExp {
        return PathField.pathRegexp;
    }

    protected fieldName(): string {
        return 'path';
    }

    protected value(task: Task): string {
        return task.path;
    }
}
