import moment from 'moment';
import { Notice } from 'obsidian';

import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { Priority } from '../../src/Task/Priority';
import {
    QuickSearchTasksModal,
    openTaskAtSourceLocation,
    taskSearchMetadataText,
    taskSearchSuggestionText,
} from '../../src/ui/QuickSearchTasksModal';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { Status } from '../../src/Statuses/Status';
import { fromMarkdown } from '../TestingTools/TestHelpers';
import { getTaskLineAndFile } from '../../src/Obsidian/File';

jest.mock('obsidian', () => ({
    ...jest.requireActual('../__mocks__/obsidian'),
    Notice: jest.fn(),
}));
jest.mock('../../src/Obsidian/File', () => ({ getTaskLineAndFile: jest.fn() }));

window.moment = moment;

const MockedNotice = jest.mocked(Notice);

// This test data is duplicated from QuickSearchTasks.test.ts,
// because we prefer reliability of tests over DRY in test code.
const writeReleaseNotes = new TaskBuilder()
    .description('Write release notes')
    .path('Projects/Release.md')
    .lineNumber(12)
    .precedingHeader('Preparation')
    .build();

const reviewRELEASEChecklist = new TaskBuilder()
    .description('Review RELEASE checklist')
    .path('Projects/Review.md')
    .lineNumber(31)
    .precedingHeader('Quality')
    .build();

const releaseCompleted = new TaskBuilder()
    .description('Release completed')
    .status(Status.DONE)
    .path('Archive.md')
    .build();

const reviewADocument = new TaskBuilder()
    .description('Review a document')
    .tags(['#release'])
    .path('Projects/Review.md')
    .build();

// These are added in alphabetical order by description
const tasks = [releaseCompleted, reviewRELEASEChecklist, reviewADocument, writeReleaseNotes];

describe('Describing matching task', () => {
    it('should provide the description, source file name, and preceding heading for each suggestion', () => {
        expect(taskSearchSuggestionText(writeReleaseNotes)).toEqual({
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
});

describe('Rendering matching tasks', () => {
    function getCheckbox(element: HTMLDivElement): HTMLElement | null {
        return element.querySelector('.tasks-quick-search-result-checkbox');
    }

    function getDescriptionTextContent(element: HTMLDivElement): string | null | undefined {
        return element.querySelector('.tasks-quick-search-result-description')?.textContent;
    }

    function getLocationTextContent(element: HTMLDivElement): string | null | undefined {
        return element.querySelector('.tasks-quick-search-result-location')?.textContent;
    }

    function getMetadata(element: HTMLDivElement): HTMLElement | null {
        return element.querySelector('.tasks-quick-search-result-metadata');
    }

    it('should render the checkbox, description, location, and metadata elements', () => {
        const modal = new QuickSearchTasksModal({} as any, () => tasks, jest.fn());
        const element = document.createElement('div');

        modal.renderSuggestion(writeReleaseNotes, element);

        expect(getCheckbox(element)).not.toBeNull();
        expect(getDescriptionTextContent(element)).toEqual('Write release notes');
        expect(getLocationTextContent(element)).toEqual('Release.md · Preparation');
        expect(getMetadata(element)).not.toBeNull();
    });

    it.each([
        [false, '#task Do Stuff'],
        [true, 'Do Stuff'],
    ])(
        'should honour "Remove global filter from description" setting: %s',
        (removeGlobalFilter: boolean, expectedDescription: string) => {
            GlobalFilter.getInstance().set('#task');
            GlobalFilter.getInstance().setRemoveGlobalFilter(removeGlobalFilter);

            const taskListWithGlobalFilter = fromMarkdown('- [ ] #task Do Stuff');

            const modal = new QuickSearchTasksModal({} as any, () => taskListWithGlobalFilter, jest.fn());
            const element = document.createElement('div');

            modal.renderSuggestion(taskListWithGlobalFilter[0], element);

            expect(getDescriptionTextContent(element)).toEqual(expectedDescription);
        },
    );

    it('should only check the checkbox for completed tasks', () => {
        const modal = new QuickSearchTasksModal({} as any, () => tasks, jest.fn());
        const incompleteElement = document.createElement('div');
        const completeElement = document.createElement('div');
        const inProgressTask = new TaskBuilder().description('In progress task').status(Status.IN_PROGRESS).build();

        modal.renderSuggestion(inProgressTask, incompleteElement);
        modal.renderSuggestion(releaseCompleted, completeElement);

        expect(incompleteElement.querySelector('input')).toMatchObject({ checked: false });
        expect(incompleteElement.querySelector('input')?.getAttribute('aria-label')).toEqual(
            'Task status: In Progress',
        );
        expect(completeElement.querySelector('input')).toMatchObject({ checked: true });
    });
});

describe('Opening a selected task', () => {
    it('should inform the user when the selected task can no longer be found', async () => {
        const app = { vault: {}, workspace: { getLeaf: jest.fn() } } as any;
        const warning = jest.spyOn(console, 'warn').mockImplementation();
        jest.mocked(getTaskLineAndFile).mockResolvedValue(undefined);

        await openTaskAtSourceLocation(writeReleaseNotes, app);

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
        const task = writeReleaseNotes;
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

        await expect(openTaskAtSourceLocation(writeReleaseNotes, app)).resolves.toBeUndefined();

        expect(error).toHaveBeenCalledWith('Tasks: Could not open task source.', expect.any(Error));
        error.mockRestore();
    });
});
