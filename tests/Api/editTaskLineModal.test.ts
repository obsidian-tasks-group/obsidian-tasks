import type { App } from 'obsidian';
import type { Task } from 'Task/Task';
import { editTaskLineModal } from 'Api/editTaskLineModal';
import { taskFromLine } from 'Commands/CreateOrEditTaskParser';
import type { TaskModalParams } from 'Obsidian/TaskModal';
import { TaskModal } from '../__mocks__/TaskModal';

const app = {} as App;
const noOpOnSaveSettings = async () => {};

const createNewTask = (line = ''): Task => {
    return taskFromLine({ line, path: '' });
};

vi.mock('../../src/Obsidian/TaskModal', () => {
    return {
        TaskModal: vi.fn(function ({ app, task, onSubmit, onCancel, allTasks }: TaskModalParams) {
            return new TaskModal({ app, task, onSubmit, onCancel, allTasks });
        }),
    };
});

describe('APIv1 - editTaskLineModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('TaskModal.open() should be called', () => {
        const taskLine = '- [ ] ';
        editTaskLineModal(app, taskLine, [], noOpOnSaveSettings);

        expect(TaskModal.instance.open).toHaveBeenCalled();
    });

    it('should return the edited Markdown', async () => {
        const taskLine = '- [ ] Updated Task';
        const taskLinePromise = editTaskLineModal(app, '- [ ] Task Name', [], noOpOnSaveSettings);

        TaskModal.instance.onSubmit([createNewTask(taskLine)]);

        const result = await taskLinePromise;
        expect(result).toEqual('- [ ] Updated Task');
    });

    it('should return empty string on cancel', async () => {
        const taskLine = '- [ ] ';
        const taskLinePromise = editTaskLineModal(app, taskLine, [], noOpOnSaveSettings);

        TaskModal.instance.cancel();

        const result = await taskLinePromise;
        expect(result).toEqual('');
    });

    it('should pass allTasks to TaskModal', () => {
        const taskLine = '- [ ] Task Name';
        const allTasks = [createNewTask('- [ ] Task 1')];

        editTaskLineModal(app, taskLine, allTasks, noOpOnSaveSettings);

        expect(TaskModal.instance.allTasks).toEqual(allTasks);
    });
});
