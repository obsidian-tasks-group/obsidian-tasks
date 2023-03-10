import type { App } from 'obsidian';
import type { Task } from '../../src/Task';
import { taskFromLine } from '../../src/Commands/CreateOrEditTaskParser';
import { createTaskLineModal } from '../../src/Api/createTaskLineModal';
import type { ITaskModal, taskModalFactory } from '../../src/Api/createTaskLineModal';

const app = {} as App;

class TaskModalMock implements ITaskModal {
    public task: Task;
    public onSubmit: (updatedTasks: Task[]) => void;
    public openWasCalled: boolean = false;

    constructor() {
        this.task = createNewTask();
        this.onSubmit = (_: Task[]) => {};
    }

    public open() {
        this.openWasCalled = true;
    }

    // helper method to simulate pressing the submit button
    public submit() {
        this.onSubmit([this.task]);
    }

    // helper method to simulate pressing the cancel button
    public cancel() {
        this.onSubmit([]);
    }
}

const createNewTask = (line = ''): Task => {
    return taskFromLine({ line, path: '' });
};

function mockModalFactory(modalMock: TaskModalMock) {
    return (_: App, onSubmit: (updatedTasks: Task[]) => void): ITaskModal => {
        modalMock.onSubmit = onSubmit;
        return modalMock;
    };
}

describe('APIv1 - createTaskLineModal', () => {
    let modalMock: TaskModalMock;
    let modalFactory: taskModalFactory;

    beforeEach(() => {
        modalMock = new TaskModalMock();
        modalFactory = mockModalFactory(modalMock);
    });

    it('TaskModal.open() should be called', () => {
        createTaskLineModal(app, modalFactory);
        expect(modalMock.openWasCalled).toBeTruthy();
    });

    it('should return the Markdown for a task if submitted', async () => {
        const taskLinePromise = createTaskLineModal(app, modalFactory);
        const expected = '- [ ] test';

        modalMock.task = createNewTask(expected);
        modalMock.submit();
        const result = await taskLinePromise;

        expect(result).toEqual(expected);
    });

    it('should return an empty string if cancelled', async () => {
        const taskLinePromise = createTaskLineModal(app, mockModalFactory(modalMock));
        const expected = '';

        modalMock.task = createNewTask(expected);
        modalMock.cancel();

        const result = await taskLinePromise;
        expect(result).toEqual(expected);
    });
});
