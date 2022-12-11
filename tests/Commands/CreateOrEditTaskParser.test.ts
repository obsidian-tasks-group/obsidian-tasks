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
        [
            'Non-blank line, not a task', // Blank line, not yet a task
            '- [ ] Non-blank line, not a task',
        ],
        [
            'Some existing test with ^block-link', // Ensure block link is retained
            '- [ ] Some existing test with ^block-link',
        ],
    ])('lined loaded into "Create or edit task" command: "%s"', (line: string, expectedResult) => {
        const path = 'a/b/c.md';
        const task = taskFromLine({ line, path });
        expect(task.toFileLineString()).toStrictEqual(expectedResult);
        expect(task.path).toStrictEqual(path);
    });
});
