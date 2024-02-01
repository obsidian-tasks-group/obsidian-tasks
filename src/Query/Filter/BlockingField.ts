import type { SearchInfo } from '../SearchInfo';
import { FilterInstructionsBasedField } from './FilterInstructionsBasedField';

export class BlockingField extends FilterInstructionsBasedField {
    constructor() {
        super();
        this._filters.add('is blocking', (task, searchInfo: SearchInfo) => {
            return task.isBlocking(searchInfo.allTasks);
        });

        this._filters.add('is not blocking', (task, searchInfo: SearchInfo) => {
            return !task.isBlocking(searchInfo.allTasks);
        });

        this._filters.add('is blocked', (task, searchInfo: SearchInfo) => {
            return task.isBlocked(searchInfo.allTasks);
        });

        this._filters.add('is not blocked', (task, searchInfo: SearchInfo) => {
            return !task.isBlocked(searchInfo.allTasks);
        });
    }

    fieldName(): string {
        return 'blocking';
    }
}
