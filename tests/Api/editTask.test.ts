import type { App } from 'obsidian';
import moment from 'moment';
import { editTask } from '../../src/Api/editTask';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { Priority } from '../../src/Task/Priority';
import type { Task } from '../../src/Task/Task';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

const mockAppWithFile = (content: string) => {
    const file = { path: 'tasks.md' };
    const app = {
        vault: {
            getFileByPath: jest.fn().mockReturnValue(file),
            read: jest.fn().mockResolvedValue(content),
            modify: jest.fn().mockResolvedValue(undefined),
        },
    } as unknown as App;

    return { app, file };
};

describe('TasksApiV2 editTask', () => {
    afterEach(() => {
        GlobalFilter.getInstance().reset();
    });

    it('edits the task with the requested id', async () => {
        const existingTask = new TaskBuilder()
            .id('abc123')
            .description('Existing task')
            .path('tasks.md')
            .lineNumber(1)
            .build();
        const { app, file } = mockAppWithFile(['# Heading', existingTask.originalMarkdown].join('\n'));

        const task = await editTask(app, [existingTask], 'abc123', {
            description: 'Updated task',
            dueDate: '2026-02-03',
            priority: Priority.High,
        });

        const expectedMarkdown = '- [ ] Updated task 🆔 abc123 ⏫ 📅 2026-02-03';
        expect(app.vault.modify).toHaveBeenCalledWith(file, ['# Heading', expectedMarkdown].join('\n'));
        expect(task).toMatchObject({
            id: 'abc123',
            description: 'Updated task',
            dueDate: '2026-02-03',
            priority: Priority.High,
            lineNumber: 1,
            originalMarkdown: expectedMarkdown,
        });
    });

    it('preserves indentation and list marker when editing', async () => {
        const existingTask = new TaskBuilder()
            .id('abc123')
            .description('Existing task')
            .indentation('  ')
            .listMarker('*')
            .path('tasks.md')
            .lineNumber(0)
            .build();
        const { app, file } = mockAppWithFile(existingTask.originalMarkdown);

        await editTask(app, [existingTask], 'abc123', { description: 'Updated task' });

        expect(app.vault.modify).toHaveBeenCalledWith(file, '  * [ ] Updated task 🆔 abc123');
    });

    it('prepends the global filter when editing', async () => {
        GlobalFilter.getInstance().set('#task');
        const existingTask = new TaskBuilder()
            .id('abc123')
            .description('Existing task')
            .path('tasks.md')
            .lineNumber(0)
            .build();
        const { app, file } = mockAppWithFile(existingTask.originalMarkdown);

        const task = await editTask(app, [existingTask], 'abc123', { description: 'Updated task' });

        expect(app.vault.modify).toHaveBeenCalledWith(file, '- [ ] #task Updated task 🆔 abc123');
        expect(task.description).toBe('Updated task');
        expect(task.originalMarkdown).toBe('- [ ] #task Updated task 🆔 abc123');
    });

    it('finds a unique matching original markdown line if the original line number has moved', async () => {
        const existingTask = new TaskBuilder()
            .id('abc123')
            .description('Existing task')
            .path('tasks.md')
            .lineNumber(0)
            .build();
        const { app, file } = mockAppWithFile(['# New heading', existingTask.originalMarkdown].join('\n'));

        const task = await editTask(app, [existingTask], 'abc123', { description: 'Updated task' });

        expect(app.vault.modify).toHaveBeenCalledWith(
            file,
            ['# New heading', '- [ ] Updated task 🆔 abc123'].join('\n'),
        );
        expect(task.lineNumber).toBe(1);
    });

    it('throws when the task id is empty', async () => {
        const { app } = mockAppWithFile('');

        await expect(editTask(app, [], '', {})).rejects.toThrow('TasksApiV2.editTask requires a non-empty taskId.');
    });

    it('throws when no task matches the requested id', async () => {
        const { app } = mockAppWithFile('');

        await expect(editTask(app, [], 'missing-id', {})).rejects.toThrow(
            "TasksApiV2.editTask could not find task 'missing-id'.",
        );
    });

    it('throws when multiple tasks match the requested id', async () => {
        const tasks: Task[] = [new TaskBuilder().id('abc123').build(), new TaskBuilder().id('abc123').build()];
        const { app } = mockAppWithFile('');

        await expect(editTask(app, tasks, 'abc123', {})).rejects.toThrow(
            "TasksApiV2.editTask found multiple tasks with id 'abc123'.",
        );
    });
});
