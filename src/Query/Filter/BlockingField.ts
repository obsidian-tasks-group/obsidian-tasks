import type { Task } from '../../Task';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class BlockingField extends FilterInstructionsBasedField {
    constructor() {
        super();
        this._filters.add('is blocking', (task, allTasks: Task[]) => {
            if (task.id === '') return false;

            return allTasks.some((cacheTask) => {
                return cacheTask.dependsOn.includes(task.id);
            });
        });
        this._filters.add('is not blocked', (_task, _allTasks) => {
            return true;
        });
    }

    fieldName(): string {
        return 'blocking';
    }
}
