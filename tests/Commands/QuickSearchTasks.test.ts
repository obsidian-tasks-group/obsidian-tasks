import moment from 'moment';
import { Notice } from 'obsidian';
import {
    QuickSearchTasksModal,
    filterIncompleteTasksByDescription,
    openTaskAtSourceLocation,
    taskSearchMetadataText,
    taskSearchSuggestionText,
} from '../../src/Commands/QuickSearchTasks';
import { Commands } from '../../src/Commands';
import { getTaskLineAndFile } from '../../src/Obsidian/File';
import { Priority } from '../../src/Task/Priority';
import { Status } from '../../src/Statuses/Status';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

jest.mock('obsidian', () => ({
    ...jest.requireActual('../__mocks__/obsidian'),
    Notice: jest.fn(),
}));
jest.mock('../../src/Obsidian/File', () => ({ getTaskLineAndFile: jest.fn() }));

window.moment = moment;

const MockedNotice = jest.mocked(Notice);
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

describe('Registering the command', () => {
    it('should register the quick search command', () => {
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
                id: 'quick-search',
                name: 'Quick search',
            }),
        );
    });
});

describe('Quick search', () => {
    it('should return only incomplete tasks whose descriptions contain the query, ignoring case', () => {
        expect(filterIncompleteTasksByDescription(tasks, 'release')).toEqual([tasks[0], tasks[1]]);
    });

    it('should not show results until the user enters a search query', () => {
        expect(filterIncompleteTasksByDescription(tasks, '')).toHaveLength(0);
        expect(filterIncompleteTasksByDescription(tasks, '   ')).toHaveLength(0);
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

    it('should list due dates before scheduled and start dates in task metadata', () => {
        const task = new TaskBuilder()
            .priority(Priority.High)
            .startDate('2023-07-02')
            .scheduledDate('2023-07-03')
            .dueDate('2023-07-04')
            .build();

        expect(taskSearchMetadataText(task)).toEqual([
            expect.stringContaining('2023-07-04'),
            expect.stringContaining('2023-07-03'),
            expect.stringContaining('2023-07-02'),
            expect.any(String),
        ]);
    });

    it('should render the checkbox, description, location, and metadata elements', () => {
        const modal = new QuickSearchTasksModal({} as any, () => tasks);
        const element = document.createElement('div');

        modal.renderSuggestion(tasks[0], element);

        expect(element.querySelector('.tasks-quick-search-result-checkbox')).not.toBeNull();
        expect(element.querySelector('.tasks-quick-search-result-description')?.textContent).toEqual(
            'Write release notes',
        );
        expect(element.querySelector('.tasks-quick-search-result-location')?.textContent).toEqual(
            'Release.md · Preparation',
        );
        expect(element.querySelector('.tasks-quick-search-result-metadata')).not.toBeNull();
    });

    it('should only check the checkbox for completed tasks', () => {
        const modal = new QuickSearchTasksModal({} as any, () => tasks);
        const incompleteElement = document.createElement('div');
        const completeElement = document.createElement('div');
        const inProgressTask = new TaskBuilder().description('In progress task').status(Status.IN_PROGRESS).build();

        modal.renderSuggestion(inProgressTask, incompleteElement);
        modal.renderSuggestion(tasks[2], completeElement);

        expect(incompleteElement.querySelector('input')).toMatchObject({ checked: false });
        expect(incompleteElement.querySelector('input')?.getAttribute('aria-label')).toEqual(
            'Task status: In Progress',
        );
        expect(completeElement.querySelector('input')).toMatchObject({ checked: true });
    });

    it('should inform the user when the selected task can no longer be found', async () => {
        const app = { vault: {}, workspace: { getLeaf: jest.fn() } } as any;
        const warning = jest.spyOn(console, 'warn').mockImplementation();
        jest.mocked(getTaskLineAndFile).mockResolvedValue(undefined);

        await openTaskAtSourceLocation(tasks[0], app);

        expect(app.workspace.getLeaf).not.toHaveBeenCalled();
        expect(warning).toHaveBeenCalledWith(
            'Tasks: Could not open the selected task.\nIt may have changed. Try searching again.',
        );
        expect(MockedNotice).toHaveBeenCalledWith(
            'Tasks: Could not open the selected task.\nIt may have changed. Try searching again.',
        );
        warning.mockRestore();
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
