import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { GlobalFilter } from '../../src/Config/GlobalFilter';

describe('CreateOrEditTaskParser - testing edited task if line is saved unchanged', () => {
    afterEach(() => {
        GlobalFilter.reset();
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
        [
            '- [!] Not a task as no global filter - unknown status symbol', // Ensure unknown status symbol is retained in non-tasks
            '- [!] Not a task as no global filter - unknown status symbol', // The global filter doesn't get added until the Modal rewrites the line
            '#task',
        ],
    ])(
        'line loaded into "Create or edit task" command: "%s"',
        (line: string, expectedResult: string, globalFilter: string) => {
            GlobalFilter.set(globalFilter);
            const path = 'a/b/c.md';
            const task = taskFromLine({ line, path });
            expect(task.toFileLineString()).toStrictEqual(expectedResult);
            expect(task.path).toStrictEqual(path);
        },
    );
});
