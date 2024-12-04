import { Grouper, type GrouperFunction } from '../../../src/Query/Group/Grouper';
import type { Task } from '../../../src/Task/Task';
import type { SearchInfo } from '../../../src/Query/SearchInfo';

describe('Grouper', () => {
    it('should supply the original instruction', () => {
        const grouperFunction: GrouperFunction = (task: Task, _searchInfo: SearchInfo) => {
            return [task.lineNumber.toString()];
        };
        const grouper = new Grouper('group by lineNumber', 'lineNumber', grouperFunction, false);

        expect(grouper.instruction).toBe('group by lineNumber');
    });
});
