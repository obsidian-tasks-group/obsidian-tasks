import type { SearchInfo } from '../SearchInfo';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class BlockingField extends FilterInstructionsBasedField {
    constructor() {
        super();
        this._filters.add('is blocking', (task, searchInfo: SearchInfo) => {
            return task.isBlocking(searchInfo.allTasks);
        });

        this._filters.add('is not blocked', (task, searchInfo: SearchInfo) => {
            if (task.blockedBy.length === 0) return true;

            for (const depId of task.blockedBy) {
                const depTask = searchInfo.allTasks.find((task) => task.id === depId);

                if (!depTask) continue;

                if (!depTask.status.isCompleted()) return false;
            }

            return true;
        });
    }

    fieldName(): string {
        return 'blocking';
    }
}
