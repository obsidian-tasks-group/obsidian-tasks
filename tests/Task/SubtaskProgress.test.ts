import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { StatusType } from '../../src/Statuses/StatusConfiguration';
import {
    renderSubtaskProgress,
    subtaskProgressFromLines,
    subtaskProgressOfListItem,
    tallyStatusTypes,
} from '../../src/Task/SubtaskProgress';
import { ListItem } from '../../src/Task/ListItem';
import { TaskLocation } from '../../src/Task/TaskLocation';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Task } from '../../src/Task/Task';
import { fromLine, fromMarkdown } from '../TestingTools/TestHelpers';

afterEach(() => {
    GlobalFilter.getInstance().reset();
});

describe('tallyStatusTypes', () => {
    it('counts done, in-progress and not-done tasks', () => {
        expect(
            tallyStatusTypes([StatusType.DONE, StatusType.TODO, StatusType.IN_PROGRESS, StatusType.ON_HOLD]),
        ).toEqual({ done: 1, inProgress: 1, total: 4 });
    });

    it('leaves out cancelled and non-task statuses', () => {
        expect(tallyStatusTypes([StatusType.DONE, StatusType.CANCELLED, StatusType.NON_TASK])).toEqual({
            done: 1,
            inProgress: 0,
            total: 1,
        });
    });

    it('returns null when there is nothing to count', () => {
        expect(tallyStatusTypes([])).toBeNull();
        expect(tallyStatusTypes([StatusType.CANCELLED])).toBeNull();
    });
});

describe('subtaskProgressOfListItem', () => {
    it('counts all descendant tasks, including those under plain list items', () => {
        // - [ ] parent
        //     - [x] child done
        //     - [ ] child todo
        //         - [x] grandchild done
        //     - plain list item
        //         - [-] cancelled, under a plain list item
        //         - [/] in progress, under a plain list item
        // Attach each item to its parent, in the same way as FileParser does.
        const taskWithParent = (line: string, parent: ListItem | null) => new Task({ ...fromLine({ line })!, parent });
        const parent = taskWithParent('- [ ] parent', null);
        taskWithParent('    - [x] child done', parent);
        const childTodo = taskWithParent('    - [ ] child todo', parent);
        taskWithParent('        - [x] grandchild done', childTodo);
        const plainListItem = new ListItem({
            originalMarkdown: '    - plain list item',
            indentation: '    ',
            listMarker: '-',
            statusCharacter: null,
            description: 'plain list item',
            parent,
            taskLocation: TaskLocation.fromUnknownPosition(new TasksFile('file.md')),
        });
        taskWithParent('        - [-] cancelled, under a plain list item', plainListItem);
        taskWithParent('        - [/] in progress, under a plain list item', plainListItem);

        expect(subtaskProgressOfListItem(parent)).toEqual({ done: 2, inProgress: 1, total: 4 });
    });

    it('returns null for a task without subtasks', () => {
        const tasks = fromMarkdown(`
- [ ] parent
- [ ] sibling
`);
        expect(subtaskProgressOfListItem(tasks[0])).toBeNull();
    });
});

describe('subtaskProgressFromLines', () => {
    const lines = [
        '- [ ] parent', // 0
        '    - [x] child done', // 1
        '', // 2
        '\t- [ ] tab-indented child', // 3
        '        - [x] grandchild', // 4
        '    - plain list item', // 5
        '    - [-] cancelled', // 6
        '- [ ] sibling', // 7
        '    - [ ] child of sibling', // 8
        'Some text', // 9
    ];

    it('counts the more deeply indented tasks after the parent, skipping blank lines', () => {
        expect(subtaskProgressFromLines(lines, 0)).toEqual({ done: 2, inProgress: 0, total: 3 });
    });

    it('stops at the next line that is not more deeply indented', () => {
        expect(subtaskProgressFromLines(lines, 7)).toEqual({ done: 0, inProgress: 0, total: 1 });
    });

    it('returns null for tasks without subtasks, and for lines that are not tasks', () => {
        expect(subtaskProgressFromLines(lines, 1)).toBeNull();
        expect(subtaskProgressFromLines(lines, 5)).toBeNull();
        expect(subtaskProgressFromLines(lines, 9)).toBeNull();
    });

    it('works inside block quotes and callouts', () => {
        const quoted = ['> - [ ] parent', '>     - [x] child', '> - [ ] sibling'];
        expect(subtaskProgressFromLines(quoted, 0)).toEqual({ done: 1, inProgress: 0, total: 1 });
    });

    it('does not count a following block quote or callout as subtasks', () => {
        const lines = ['- [ ] parent', '', '> [!note]', '> - [ ] in a callout'];
        expect(subtaskProgressFromLines(lines, 0)).toBeNull();
    });

    it('only counts subtasks that contain the global filter', () => {
        GlobalFilter.getInstance().set('#task');
        const filtered = ['- [ ] #task parent', '    - [x] #task counted', '    - [ ] not counted'];
        expect(subtaskProgressFromLines(filtered, 0)).toEqual({ done: 1, inProgress: 0, total: 1 });
        expect(subtaskProgressFromLines(['- [ ] not a task', '    - [x] #task child'], 0)).toBeNull();
    });
});

describe('renderSubtaskProgress', () => {
    it('renders an accessible progress bar with a count', () => {
        const parent = document.createElement('div');
        renderSubtaskProgress(parent, { done: 1, inProgress: 0, total: 4 });

        const progress = parent.querySelector('.tasks-progress')!;
        expect(progress.getAttribute('role')).toEqual('progressbar');
        expect(progress.getAttribute('aria-valuenow')).toEqual('1');
        expect(progress.getAttribute('aria-valuemax')).toEqual('4');
        expect(progress.hasAttribute('data-complete')).toEqual(false);
        expect((parent.querySelector('.tasks-progress-fill') as HTMLElement).style.width).toEqual('25%');
        expect(parent.querySelector('.tasks-progress-count')!.textContent).toEqual('1/4');
    });
});
