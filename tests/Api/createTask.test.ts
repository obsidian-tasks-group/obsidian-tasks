import type { App } from 'obsidian';
import moment from 'moment';
import { createTask } from '../../src/Api/createTask';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { Priority } from '../../src/Task/Priority';

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

describe('TasksApiV2 createTask', () => {
    afterEach(() => {
        GlobalFilter.getInstance().reset();
    });

    it('inserts a task after the requested line by default', async () => {
        const { app, file } = mockAppWithFile(['# Heading', '- [ ] Existing task'].join('\n'));

        const task = await createTask(app, { path: 'tasks.md', line: 0 }, 'New task');

        expect(app.vault.modify).toHaveBeenCalledWith(
            file,
            ['# Heading', '- [ ] New task', '- [ ] Existing task'].join('\n'),
        );
        expect(task).toMatchObject({
            description: 'New task',
            path: 'tasks.md',
            lineNumber: 1,
            originalMarkdown: '- [ ] New task',
        });
    });

    it('inserts a task before the requested line', async () => {
        const { app, file } = mockAppWithFile(['# Heading', '- [ ] Existing task'].join('\n'));

        await createTask(app, { path: 'tasks.md', line: 1, placement: 'before' }, 'New task');

        expect(app.vault.modify).toHaveBeenCalledWith(
            file,
            ['# Heading', '- [ ] New task', '- [ ] Existing task'].join('\n'),
        );
    });

    it('replaces the requested line', async () => {
        const { app, file } = mockAppWithFile(['# Heading', '- [ ] Existing task'].join('\n'));

        const task = await createTask(app, { path: 'tasks.md', line: 1, placement: 'replace' }, 'Replacement');

        expect(app.vault.modify).toHaveBeenCalledWith(file, ['# Heading', '- [ ] Replacement'].join('\n'));
        expect(task.lineNumber).toBe(1);
    });

    it('appends a task to the end of the file', async () => {
        const { app, file } = mockAppWithFile(['# Heading', '- [ ] Existing task'].join('\n'));

        const task = await createTask(app, { path: 'tasks.md', placement: 'append' }, 'New task', {
            priority: Priority.High,
        });

        expect(app.vault.modify).toHaveBeenCalledWith(
            file,
            ['# Heading', '- [ ] Existing task', '- [ ] New task ⏫'].join('\n'),
        );
        expect(task).toMatchObject({
            description: 'New task',
            priority: Priority.High,
            lineNumber: 2,
        });
    });

    it('appends after the last existing task when line and placement are omitted', async () => {
        const originalLines = ['# Heading', '- [ ] First task', '- [x] Second task', '', 'Notes after the task list'];
        const updatedLines = [
            '# Heading',
            '- [ ] First task',
            '- [x] Second task',
            '- [ ] New task',
            '',
            'Notes after the task list',
        ];
        const { app, file } = mockAppWithFile(originalLines.join('\n'));

        const task = await createTask(app, { path: 'tasks.md' }, 'New task');

        expect(app.vault.modify).toHaveBeenCalledWith(file, updatedLines.join('\n'));
        expect(task.lineNumber).toBe(3);
    });

    it('appends after the last existing task list block when line and placement are omitted', async () => {
        const originalLines = [
            '# Heading',
            '- [ ] Parent task',
            '  - [ ] Child task',
            '    - Child detail',
            '',
            'Notes after the task list',
        ];
        const updatedLines = [
            '# Heading',
            '- [ ] Parent task',
            '  - [ ] Child task',
            '    - Child detail',
            '- [ ] New task',
            '',
            'Notes after the task list',
        ];
        const { app, file } = mockAppWithFile(originalLines.join('\n'));

        const task = await createTask(app, { path: 'tasks.md' }, 'New task');

        expect(app.vault.modify).toHaveBeenCalledWith(file, updatedLines.join('\n'));
        expect(task.lineNumber).toBe(4);
    });

    it('uses EOF when line and placement are omitted and the file has no task list', async () => {
        const { app, file } = mockAppWithFile(['# Heading', 'Notes only'].join('\n'));

        const task = await createTask(app, { path: 'tasks.md' }, 'New task');

        expect(app.vault.modify).toHaveBeenCalledWith(file, ['# Heading', 'Notes only', '- [ ] New task'].join('\n'));
        expect(task.lineNumber).toBe(2);
    });

    it('prepends the global filter to created task lines', async () => {
        GlobalFilter.getInstance().set('#task');
        const { app, file } = mockAppWithFile('');

        const task = await createTask(app, { path: 'tasks.md' }, 'New task');

        expect(app.vault.modify).toHaveBeenCalledWith(file, '- [ ] #task New task');
        expect(task.description).toBe('New task');
        expect(task.originalMarkdown).toBe('- [ ] #task New task');
    });

    it('throws when the destination file does not exist', async () => {
        const app = {
            vault: {
                getFileByPath: jest.fn().mockReturnValue(null),
            },
        } as unknown as App;

        await expect(createTask(app, { path: 'missing.md' }, 'New task')).rejects.toThrow(
            "TasksApiV2.createTask could not find file 'missing.md'.",
        );
    });

    it('throws when the requested line is outside the file', async () => {
        const { app } = mockAppWithFile('- [ ] Existing task');

        await expect(createTask(app, { path: 'tasks.md', line: 3 }, 'New task')).rejects.toThrow(
            "TasksApiV2.createTask line 3 is outside 'tasks.md'.",
        );
    });
});
