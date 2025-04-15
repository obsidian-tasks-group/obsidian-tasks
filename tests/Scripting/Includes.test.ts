import { Query } from '../../src/Query/Query';
import { TasksFile } from '../../src/Scripting/TasksFile';

describe('include tests', () => {
    it.failing('should accept whole-line include placeholder', () => {
        const source = '{{include.not_done}}';
        const query = new Query(source, new TasksFile('stuff.md'));

        expect(query.error).toBeUndefined();
    });
});
