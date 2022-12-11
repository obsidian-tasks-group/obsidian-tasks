import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';

describe('CreateOrEditTaskParser', () => {
    it('should process a valid Tasks task', () => {
        const line = '- [ ] Hello World';
        const path = 'a/b/c.md';
        const task = taskFromLine({ line, path });
        expect(task.toFileLineString()).toStrictEqual(line);
        expect(task.path).toStrictEqual(path);
    });
});
