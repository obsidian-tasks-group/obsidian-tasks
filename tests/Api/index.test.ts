import type { App } from 'obsidian';
import type TasksPlugin from '../../src/main';
import type { Task } from '../../src/Task/Task';
import { createTaskLineModal } from '../../src/Api/createTaskLineModal';
import { editTaskLineModal } from '../../src/Api/editTaskLineModal';
import { tasksApiV1 } from '../../src/Api/index';

jest.mock('../../src/Api/createTaskLineModal', () => ({
    createTaskLineModal: jest.fn(),
}));

jest.mock('../../src/Api/editTaskLineModal', () => ({
    editTaskLineModal: jest.fn(),
}));

describe('definition of public Api', () => {
    it('should call createTaskLineModal with the app and allTasks', async () => {
        const task = jest.fn();
        const app = {} as App; // Mock the app object
        const tasks = [task as Partial<Task>];
        const mockPlugin = {
            getTasks: () => tasks,
            app,
        } as Partial<TasksPlugin> as TasksPlugin;

        const publicApi = tasksApiV1(mockPlugin);

        await publicApi.createTaskLineModal();
        expect(createTaskLineModal).toHaveBeenCalledWith(app, tasks);
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

        await publicApi.editTaskLineModal(taskLine);
        expect(editTaskLineModal).toHaveBeenCalledWith(app, taskLine, tasks);
    });
});
