import type { App } from 'obsidian';
import type { Task } from '../../src/Task/Task';
import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { createTaskLineModal } from '../../src/Api/createTaskLineModal';
import { TaskModal } from '../__mocks__/TaskModal';

const app = {} as App;

const createNewTask = (line = ''): Task => {
    return taskFromLine({ line, path: '' });
};

jest.mock('../../src/Obsidian/TaskModal', () => {
    return {
        TaskModal: jest.fn(
            ({
                app,
                task,
                onSubmit,
                allTasks,
            }: {
                app: App;
                task: Task;
                onSubmit: (updatedTasks: Task[]) => void;
                allTasks: Task[];
            }) => {
                return new TaskModal({ app, task, onSubmit, allTasks });
            },
        ),
    };
});

describe('APIv1 - createTaskLineModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * When we ask to create the task line modal, it should call open() on the TaskModal instance.
     */
    it('TaskModal.open() should be called', () => {
        createTaskLineModal(app, []);

        expect(TaskModal.instance.open).toHaveBeenCalledTimes(1);
    });

    /**
     * If the Modal returns the expected text, the api function createTaskLineModal() returns that text
     */
    it('should return the Markdown for a task if submitted', async () => {
        const taskLinePromise = createTaskLineModal(app, []);
        const expected = '- [ ] test';

        TaskModal.instance.onSubmit([createNewTask(expected)]);
        const result = await taskLinePromise;

        expect(result).toEqual(expected);
    });

    /**
     * If the Modal is cancelled, the api function createTaskLineModal() should return an empty string
     */
    it('should return an empty string if cancelled', async () => {
        const taskLinePromise = createTaskLineModal(app, []);
        const expected = '';

        TaskModal.instance.cancel();

        const result = await taskLinePromise;
        expect(result).toEqual(expected);
    });

    it('should pass allTasks to TaskModal', async () => {
        const allTasks = [createNewTask('- [ ] test')];
        createTaskLineModal(app, allTasks);

        expect(TaskModal.instance.allTasks).toEqual(allTasks);
    });
});
