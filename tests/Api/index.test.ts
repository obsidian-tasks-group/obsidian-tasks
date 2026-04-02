import type { App } from 'obsidian';
import type TasksPlugin from '../../src/main';
import type { Task } from '../../src/Task/Task';
import { tasksApiV1 } from '../../src/Api/index';
import { TaskModal } from '../../src/Obsidian/TaskModal';

describe('definition of public Api', () => {
    let openSpy: jest.SpiedFunction<TaskModal['open']>;
    let lastOpenedModal: TaskModal | undefined;

    beforeEach(() => {
        lastOpenedModal = undefined;
        openSpy = jest.spyOn(TaskModal.prototype, 'open').mockImplementation(function (this: TaskModal) {
            lastOpenedModal = this;
        });
    });

    afterEach(() => {
        openSpy.mockRestore();
    });

    it('should call createTaskLineModal with the app and allTasks', async () => {
        const task = jest.fn();
        const app = {} as App; // Mock the app object
        const tasks = [task as Partial<Task>];
        const mockPlugin = {
            getTasks: () => tasks,
            app,
        } as Partial<TasksPlugin> as TasksPlugin;

        const publicApi = tasksApiV1(mockPlugin);

        const promise = publicApi.createTaskLineModal();
        lastOpenedModal!.onSubmit([]);
        await promise;

        expect(lastOpenedModal!.app).toBe(app);
        expect(lastOpenedModal!.allTasks).toEqual(tasks);
    });

    it('should call editTaskLineModal with the app, taskLine and allTasks', async () => {
        const task = jest.fn();
        const app = {} as App; // Mock the app object
        const tasks = [task as Partial<Task>];
        const mockPlugin = {
            getTasks: () => tasks,
            app,
        } as Partial<TasksPlugin> as TasksPlugin;
        const taskLine = '- [ ] Task Name';

        const publicApi = tasksApiV1(mockPlugin);

        const promise = publicApi.editTaskLineModal(taskLine);
        lastOpenedModal!.onSubmit([]);
        await promise;

        expect(lastOpenedModal!.app).toBe(app);
        expect(lastOpenedModal!.allTasks).toEqual(tasks);
        expect(lastOpenedModal!.task.toFileLineString()).toEqual(taskLine);
    });
});
