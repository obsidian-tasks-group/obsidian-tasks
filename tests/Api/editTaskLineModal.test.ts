import type { App } from 'obsidian';
import type { Task } from '../../src/Task/Task';
import { editTaskLineModal } from '../../src/Api/editTaskLineModal';
import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { TaskModal } from '../../src/Obsidian/TaskModal';

const app = {} as App;
const noOpOnSaveSettings = async () => {};

const createNewTask = (line = ''): Task => {
    return taskFromLine({ line, path: '' });
};

describe('APIv1 - editTaskLineModal', () => {
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

    it('TaskModal.open() should be called', () => {
        const taskLine = '- [ ] ';
        editTaskLineModal(app, taskLine, [], noOpOnSaveSettings);

        expect(openSpy).toHaveBeenCalled();
        expect(lastOpenedModal).toBeDefined();
    });

    it('should return the edited Markdown', async () => {
        const taskLine = '- [ ] Updated Task';
        const taskLinePromise = editTaskLineModal(app, '- [ ] Task Name', [], noOpOnSaveSettings);

        lastOpenedModal!.onSubmit([createNewTask(taskLine)]);

        const result = await taskLinePromise;
        expect(result).toEqual('- [ ] Updated Task');
    });

    it('should return empty string on cancel', async () => {
        const taskLine = '- [ ] ';
        const taskLinePromise = editTaskLineModal(app, taskLine, [], noOpOnSaveSettings);

        lastOpenedModal!.onSubmit([]);

        const result = await taskLinePromise;
        expect(result).toEqual('');
    });

    it('should pass allTasks to TaskModal', () => {
        const taskLine = '- [ ] Task Name';
        const allTasks = [createNewTask('- [ ] Task 1')];

        editTaskLineModal(app, taskLine, allTasks, noOpOnSaveSettings);

        expect(lastOpenedModal!.allTasks).toEqual(allTasks);
    });
});
