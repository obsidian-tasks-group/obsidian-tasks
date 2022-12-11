import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { resetSettings, updateSettings } from '../../src/Config/Settings';

describe('CreateOrEditTaskParser - testing edited task if line is saved unchanged', () => {
    afterEach(() => {
        resetSettings();
    });

    it.each([
        [
            '- [ ] Hello World', // Simple case, where a line is recognised as a task
            '- [ ] Hello World',
            '',
        ],
        [
            '* [ ] #task Hello World - with asterisk list marker', // Simple case, with global filter - using * as list marker
            '* [ ] #task Hello World - with asterisk list marker',
            '#task',
        ],
        [
            '    - [x] Hello World', // Completed task, indented
            '    - [x] Hello World',
            '',
        ],
        [
            '', // Blank line, not yet a task
            '- [ ] ', // Loads an empty task in to Edit modal
            '',
        ],
        [
            'Non-blank line, not a task', // Blank line, not yet a task
            '- [ ] Non-blank line, not a task',
            '',
        ],
        [
            '* Non-blank line, not a task - with asterisk list marker',
            '* [ ] Non-blank line, not a task - with asterisk list marker',
            '',
        ],
        [
            'Non-blank line, not a task', // Blank line, not yet a task - settings have global filter
            '- [ ] Non-blank line, not a task', // The global filter doesn't get added until the Modal rewrites the line
            '#task',
        ],
        [
            'Some existing test with ^block-link', // Ensure block link is retained
            '- [ ] Some existing test with ^block-link',
            '',
        ],
    ])(
        'line loaded into "Create or edit task" command: "%s"',
        (line: string, expectedResult: string, globalFilter: string) => {
            updateSettings({ globalFilter: globalFilter });
            const path = 'a/b/c.md';
            const task = taskFromLine({ line, path });
            expect(task.toFileLineString()).toStrictEqual(expectedResult);
            expect(task.path).toStrictEqual(path);
        },
    );
});
