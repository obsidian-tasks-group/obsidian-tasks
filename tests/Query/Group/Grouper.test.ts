import { Grouper, type GrouperFunction } from '../../../src/Query/Group/Grouper';
import type { Task } from '../../../src/Task/Task';
import type { SearchInfo } from '../../../src/Query/SearchInfo';
import { Statement } from '../../../src/Query/Statement';

describe('Grouper', () => {
    const grouperFunction: GrouperFunction = (task: Task, _searchInfo: SearchInfo) => {
        return [task.lineNumber.toString()];
    };

    it('should supply the original instruction', () => {
        const grouper = new Grouper('group by lineNumber', 'lineNumber', grouperFunction, false);

        expect(grouper.instruction).toBe('group by lineNumber');
        expect(grouper.statement.rawInstruction).toBe('group by lineNumber');
    });

    it('should store a Statement object', () => {
        const instruction = 'group by lineNumber';
        const statement = new Statement(instruction, instruction);
        const grouper = new Grouper('group by lineNumber', 'lineNumber', grouperFunction, false);

        grouper.setStatement(statement);

        expect(grouper.statement.rawInstruction).toBe('group by lineNumber');
    });
});
