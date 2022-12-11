import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';

describe('CreateOrEditTaskParser - testing edited task if line is saved unchanged', () => {
    it.each([
        [
            '- [ ] Hello World', // Simple case, where a line is recognised as a task
            '- [ ] Hello World',
        ],
        [
            '    - [ ] Hello World', // Simple case, but indented
            '    - [ ] Hello World',
        ],
        [
            '', // Blank line, not yet a task
            '- [ ] ', // Loads an empty task in to Edit modal
        ],
    ])('lined loaded into "Create or edit task" command: "%s"', (line: string, expectedResult) => {
        const path = 'a/b/c.md';
        const task = taskFromLine({ line, path });
        expect(task.toFileLineString()).toStrictEqual(expectedResult);
        expect(task.path).toStrictEqual(path);
    });
});
