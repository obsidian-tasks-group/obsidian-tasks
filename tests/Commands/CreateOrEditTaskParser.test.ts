/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { updateSettings } from '../../src/Config/Settings';
import { Priority } from '../../src/Task';
import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { GlobalFilter } from '../../src/Config/GlobalFilter';

window.moment = moment;

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

describe('CreateOrEditTaskParser - task recognition', () => {
    afterEach(() => {
        GlobalFilter.reset();
    });

    it('should recognize task details without global filter', () => {
        GlobalFilter.set('#task');
        const taskLine =
            '- [ ] without global filter but with all the info ⏬ 🔁 every 2 days ➕ 2022-03-10 🛫 2022-01-31 ⏳ 2023-06-13 📅 2024-12-10 ✅ 2023-06-22';
        const path = 'a/b/c.md';

        const task = taskFromLine({ line: taskLine, path });

        expect(task.toFileLineString()).toStrictEqual(taskLine);
        expect(task.path).toStrictEqual('a/b/c.md');

        expect(task.priority).toStrictEqual(Priority.Lowest);
        expect(task.recurrenceRule).toStrictEqual('every 2 days');
        expect(task.createdDate).toEqualMoment(moment('2022-03-10'));
        expect(task.startDate).toEqualMoment(moment('2022-01-31'));
        expect(task.scheduledDate).toEqualMoment(moment('2023-06-13'));
        expect(task.dueDate).toEqualMoment(moment('2024-12-10'));
        expect(task.doneDate).toEqualMoment(moment('2023-06-22'));
    });
});

describe('CreateOrEditTaskParser - created date', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-09-17'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it.each([
        [
            '- [ ] without global filter and without created date', // nominal use-case
            '- [ ] without global filter and without created date ➕ 2023-09-17',
            '2023-09-17',
        ],
        ['- [ ] ', '- [ ]  ➕ 2023-09-17', '2023-09-17'], // bullet point and a checkbox
        ['- ', '- [ ]  ➕ 2023-09-17', '2023-09-17'], // bullet point only
        [
            '- [ ] without global filter and with ➕ 2023-01-20', // with an existing created date
            '- [ ] without global filter and with ➕ 2023-01-20',
            '2023-01-20',
        ],
    ])(
        'line loaded into "Create or edit task" command: "%s"',
        (line: string, expectedTaskLine: string, expectedCreatedDate: string) => {
            updateSettings({ setCreatedDate: true });
            const path = 'a/b/c.md';

            const task = taskFromLine({ line, path });

            expect(task.toFileLineString()).toStrictEqual(expectedTaskLine);
            expect(task.createdDate).toEqualMoment(moment(expectedCreatedDate));
        },
    );
});
