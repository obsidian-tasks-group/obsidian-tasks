import type { App } from 'obsidian';
import type { Task } from '../../src/Task/Task';
import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { createTaskLineModal } from '../../src/Api/createTaskLineModal';
import { TaskModal } from '../../src/Obsidian/TaskModal';

const app = {} as App;
const noOpOnSaveSettings = async () => {};

const createNewTask = (line = ''): Task => {
    return taskFromLine({ line, path: '' });
};

describe('APIv1 - createTaskLineModal', () => {
    let openSpy: jest.SpiedFunction<TaskModal['open']>;
    let lastOpenedModal: TaskModal | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        lastOpenedModal = undefined;
        openSpy = jest.spyOn(TaskModal.prototype, 'open').mockImplementation(function (this: TaskModal) {
            lastOpenedModal = this;
        });
    });

    afterEach(() => {
        openSpy.mockRestore();
    });

    /**
     * When we ask to create the task line modal, it should call open() on the TaskModal instance.
     */
    it('TaskModal.open() should be called', () => {
        createTaskLineModal(app, [], noOpOnSaveSettings);

        expect(openSpy).toHaveBeenCalledTimes(1);
        expect(lastOpenedModal).toBeDefined();
    });

    /**
     * If the Modal returns the expected text, the api function createTaskLineModal() returns that text
     */
    it('should return the Markdown for a task if submitted', async () => {
        const taskLinePromise = createTaskLineModal(app, [], noOpOnSaveSettings);
        const expected = '- [ ] test';

        lastOpenedModal!.onSubmit([createNewTask(expected)]);
        const result = await taskLinePromise;

        expect(result).toEqual(expected);
    });

    /**
     * If the Modal is cancelled, the api function createTaskLineModal() should return an empty string
     */
    it('should return an empty string if cancelled', async () => {
        const taskLinePromise = createTaskLineModal(app, [], noOpOnSaveSettings);
        const expected = '';

        lastOpenedModal!.onSubmit([]);

        const result = await taskLinePromise;
        expect(result).toEqual(expected);
    });

    it('should pass allTasks to TaskModal', async () => {
        const allTasks = [createNewTask('- [ ] test')];
        void createTaskLineModal(app, allTasks, noOpOnSaveSettings);

        expect(lastOpenedModal!.allTasks).toEqual(allTasks);
    });
});
