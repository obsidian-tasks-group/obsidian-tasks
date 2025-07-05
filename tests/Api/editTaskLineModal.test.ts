import type { App } from 'obsidian';
import type { Task } from '../../src/Task/Task';
import { editTaskLineModal } from '../../src/Api/editTaskLineModal';
import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { TaskModal } from '../__mocks__/TaskModal';
import type { TaskModalParams } from '../../src/Obsidian/TaskModal';

const app = {} as App;

const createNewTask = (line = ''): Task => {
    return taskFromLine({ line, path: '' });
};

jest.mock('../../src/Obsidian/TaskModal', () => {
    return {
        TaskModal: jest.fn(({ app, task, onSubmit, allTasks }: TaskModalParams) => {
            return new TaskModal({ app, task, onSubmit, allTasks });
        }),
    };
});

describe('APIv1 - editTaskLineModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('TaskModal.open() should be called', () => {
        const taskLine = '- [ ] ';
        editTaskLineModal(app, taskLine, []);

        expect(TaskModal.instance.open).toHaveBeenCalled();
    });

    it('should return the edited Markdown', async () => {
        const taskLine = '- [ ] Updated Task';
        const taskLinePromise = editTaskLineModal(app, '- [ ] Task Name', []);

        TaskModal.instance.onSubmit([createNewTask(taskLine)]);

        const result = await taskLinePromise;
        expect(result).toEqual('- [ ] Updated Task');
    });

    it('should return empty string on cancel', async () => {
        const taskLine = '- [ ] ';
        const taskLinePromise = editTaskLineModal(app, taskLine, []);

        TaskModal.instance.cancel();

        const result = await taskLinePromise;
        expect(result).toEqual('');
    });

    it('should pass allTasks to TaskModal', () => {
        const taskLine = '- [ ] Task Name';
        const allTasks = [createNewTask('- [ ] Task 1')];

        editTaskLineModal(app, taskLine, allTasks);

        expect(TaskModal.instance.allTasks).toEqual(allTasks);
    });
});
