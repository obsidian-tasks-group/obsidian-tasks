import {
    filterIncompleteTasksByDescription,
    openTaskAtSourceLocation,
    taskSearchSuggestionText,
} from '../../src/Commands/SearchTasks';
import { Commands } from '../../src/Commands';
import { getTaskLineAndFile } from '../../src/Obsidian/File';
import { Status } from '../../src/Statuses/Status';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

jest.mock('obsidian');
jest.mock('../../src/Obsidian/File', () => ({ getTaskLineAndFile: jest.fn() }));

describe('Search tasks', () => {
    const tasks = [
        new TaskBuilder()
            .description('Write release notes')
            .path('Projects/Release.md')
            .lineNumber(12)
            .precedingHeader('Preparation')
            .build(),
        new TaskBuilder()
            .description('Review RELEASE checklist')
            .path('Projects/Review.md')
            .lineNumber(31)
            .precedingHeader('Quality')
            .build(),
        new TaskBuilder().description('Release completed').status(Status.DONE).path('Archive.md').build(),
        new TaskBuilder().description('Review a document').tags(['#release']).path('Projects/Review.md').build(),
    ];

    it('should return only incomplete tasks whose descriptions contain the query, ignoring case', () => {
        expect(filterIncompleteTasksByDescription(tasks, 'release')).toEqual([tasks[0], tasks[1]]);
    });

    it('should register the search tasks command', () => {
        const addCommand = jest.fn();
        new Commands({
            plugin: {
                app: {},
                addCommand,
                getTasks: () => [],
            } as any,
        });

        expect(addCommand).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'search-tasks',
                name: 'Search tasks',
            }),
        );
    });

    it('should return all incomplete tasks for an empty query', () => {
        expect(filterIncompleteTasksByDescription(tasks, '')).toEqual([tasks[0], tasks[1], tasks[3]]);
    });

    it('should not match task tags', () => {
        expect(filterIncompleteTasksByDescription(tasks, '#release')).toEqual([]);
    });

    it('should provide the description, source file name, and preceding heading for each suggestion', () => {
        expect(taskSearchSuggestionText(tasks[0])).toEqual({
            description: 'Write release notes',
            source: 'Release.md',
            heading: 'Preparation',
        });
    });

    it('should use a clear fallback when a task has no preceding heading', () => {
        const task = new TaskBuilder().description('Inbox task').path('Inbox.md').precedingHeader(null).build();

        expect(taskSearchSuggestionText(task)).toEqual({
            description: 'Inbox task',
            source: 'Inbox.md',
            heading: 'No heading',
        });
    });

    it('should open the selected task at its current source line', async () => {
        const openFile = jest.fn();
        const app = {
            vault: {},
            workspace: { getLeaf: jest.fn(() => ({ openFile })) },
        } as any;
        const task = tasks[0];
        const file = { path: 'Projects/Release.md' } as any;
        jest.mocked(getTaskLineAndFile).mockResolvedValue([12, file]);

        await openTaskAtSourceLocation(task, app);

        expect(app.workspace.getLeaf).toHaveBeenCalledWith(false);
        expect(openFile).toHaveBeenCalledWith(file, { eState: { line: 12 } });
    });

    it('should handle a failure to open the selected task source', async () => {
        const openFile = jest.fn().mockRejectedValue(new Error('Unable to open file'));
        const app = {
            vault: {},
            workspace: { getLeaf: jest.fn(() => ({ openFile })) },
        } as any;
        const error = jest.spyOn(console, 'error').mockImplementation();
        jest.mocked(getTaskLineAndFile).mockResolvedValue([12, { path: 'Projects/Release.md' } as any]);

        await expect(openTaskAtSourceLocation(tasks[0], app)).resolves.toBeUndefined();

        expect(error).toHaveBeenCalledWith('Tasks: Could not open task source.', expect.any(Error));
        error.mockRestore();
    });
});
