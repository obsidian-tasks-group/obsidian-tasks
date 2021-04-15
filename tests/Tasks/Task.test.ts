import { Status } from '../../src/Tasks/Status';
import { Task } from '../../src/Tasks/Task';

describe('fromLine', () => {
    it('parses a task from a line', () => {
        const line = '- [ ] #task take out the trash';
        const path = 'example/path.md';

        const task = Task.fromLine({
            line,
            path,
            pageIndex: undefined,
            lineNumber: undefined,
            precedingHeader: undefined,
        });

        expect(task).toBeDefined();
        expect(task!.description).toEqual('take out the trash');
        expect(task!.status).toEqual(Status.TODO);
    });
});
