import { type Comparator, Sorter } from '../../../src/Query/Sort/Sorter';
import type { Task } from '../../../src/Task/Task';
import type { SearchInfo } from '../../../src/Query/SearchInfo';

describe('Sorter', () => {
    const comparator: Comparator = (a: Task, b: Task, _searchInfo: SearchInfo) => {
        return a.lineNumber - b.lineNumber;
    };

    it('should supply the original instruction', () => {
        const sorter = new Sorter('sort by lineNumber', 'lineNumber', comparator, false);

        expect(sorter.instruction).toBe('sort by lineNumber');
    });
});
