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
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { fromLines, fromMarkdown } from '../TestingTools/TestHelpers';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import type { PresetsMap } from '../../src/Query/Presets/Presets';
import { resetSettings, updateSettings } from '../../src/Config/Settings';

jest.mock('obsidian', () => ({
    ...jest.requireActual('../__mocks__/obsidian'),
    Notice: jest.fn(),
}));
jest.mock('../../src/Obsidian/File', () => ({ getTaskLineAndFile: jest.fn() }));

window.moment = moment;

const MockedNotice = jest.mocked(Notice);

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

afterEach(() => {
    GlobalFilter.getInstance().reset();
    GlobalFilter.getInstance().setRemoveGlobalFilter(false);

    GlobalQuery.getInstance().reset();

    resetSettings();
});

describe('validate test data', () => {
    it('should have sample tasks be alphabetical by description, so that sorting can be tested separately', () => {
        const descriptions = tasks.map((task) => task.description);
        expect(descriptions).toBeSorted();
    });
});

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

describe('Finding matching tasks', () => {
    it('should return only incomplete tasks whose descriptions contain the query, ignoring case', () => {
        expect(filterIncompleteTasksByDescription(tasks, 'release')).toEqual([
            reviewRELEASEChecklist,
            writeReleaseNotes,
        ]);
    });

    it('should not show results until the user enters a search query', () => {
        expect(filterIncompleteTasksByDescription(tasks, '')).toHaveLength(0);
        expect(filterIncompleteTasksByDescription(tasks, '   ')).toHaveLength(0);
    });

    it('should not match task tags', () => {
        expect(filterIncompleteTasksByDescription(tasks, '#release')).toEqual([]);
    });
});

describe('Finding matching tasks, honouring the Global Query', () => {
    type GlobalQueryTestCase = [
        testName: string,
        query: string,
        globalQuerySource: string,
        descriptions: string[],
        expectedFoundDescriptions: string[],
        presets: PresetsMap,
    ];

    it.each<GlobalQueryTestCase>([
        [
            'should honour single-instruction Global Query',
            'release',
            'description includes Write',
            ['Review RELEASE checklist', 'Write release notes'],
            ['Write release notes'],
            {},
        ],
        [
            'should ignore Global Query with invalid parse-time instruction',
            'release',
            'description includes Write\nUNKNOWN INSTRUCTION RENDERS GLOBAL QUERY INVALID',
            ['Review RELEASE checklist', 'Write release notes'],
            ['Review RELEASE checklist', 'Write release notes'],
            {},
        ],
        [
            'should ignore Global Query with invalid search-time instruction',
            'release',
            'filter by function task.wibble',
            ['Review RELEASE checklist', 'Write release notes'],
            ['Review RELEASE checklist', 'Write release notes'],
            {},
        ],
        [
            'should honour preset instructions in the Global Query',
            'release',
            'preset simple',
            ['Review RELEASE checklist', 'Write release notes'],
            ['Review RELEASE checklist'],
            { simple: 'description includes review' },
        ],
        [
            'should honour placeholder-style presets in the Global Query',
            'release',
            '{{preset.simple}}',
            ['Review RELEASE checklist', 'Write release notes'],
            ['Review RELEASE checklist'],
            { simple: 'description includes review' },
        ],
    ])(
        '%s',
        (
            _,
            query: string,
            globalQuerySource: string,
            descriptions: string[],
            expectedFoundDescriptions: string[],
            presets: PresetsMap,
        ) => {
            updateSettings({ presets });
            GlobalQuery.getInstance().set(globalQuerySource);

            const tasks = descriptions.map((description) => new TaskBuilder().description(description).build());

            const foundDescriptions = filterIncompleteTasksByDescription(tasks, query).map((task) => task.description);
            expect(foundDescriptions).toEqual(expectedFoundDescriptions);
        },
    );
});

describe('Finding matching tasks, sorting results in expected order', () => {
    type DescriptionSortingTestCase = [
        testName: string,
        query: string,
        descriptions: string[],
        expectedFoundDescriptions: string[],
    ];

    it.each<DescriptionSortingTestCase>([
        [
            // Force line break
            'should preserve original order, if already sorted',
            'aaa',
            ['Aaaa', 'Zaaa'],
            ['Aaaa', 'Zaaa'],
        ],
        [
            // Force line break
            'should sort alphabetically',
            'aaa',
            ['Zaaa', 'Aaaa'],
            ['Aaaa', 'Zaaa'],
        ],
        [
            // Force line break
            'should sort leading numbers in ascending order',
            'x',
            ['9 x', '11 x'],
            ['9 x', '11 x'],
        ],
        [
            // Force line break
            'should sort trailing numbers in ascending order',
            'x',
            ['x 9', 'x 11'],
            ['x 9', 'x 11'],
        ],
        [
            // Force line break
            'should ignore markdown formatting',
            'z',
            ['**Bz**', 'Az'],
            ['Az', '**Bz**'],
        ],
    ])('%s', (_, query: string, descriptions: string[], expectedFoundDescriptions: string[]) => {
        const tasks = descriptions.map((description) => new TaskBuilder().description(description).build());

        const foundDescriptions = filterIncompleteTasksByDescription(tasks, query).map((task) => task.description);
        expect(foundDescriptions).toEqual(expectedFoundDescriptions);
    });

    describe('handling identical descriptions', () => {
        function expectSortsInExpectedOrder(lines: string[], expectedOrder: string[]): void {
            const tasks = fromLines({ lines });

            // Ensure we have enough tasks to make the test meaningful:
            expect(tasks.length).toBeGreaterThanOrEqual(2);

            // Ensure that all task.description values are identical, so we are definitely testing
            // the effect of other properties on the sort order:
            expect(new Set(tasks.map((task) => task.description)).size).toBe(1);

            const query = tasks[0].description;

            const result = filterIncompleteTasksByDescription(tasks, query);
            expect(result.map((task) => task.originalMarkdown)).toEqual(expectedOrder);

            // Repeat the sort, with the tasks initially in reverse order
            const reverse = filterIncompleteTasksByDescription(tasks.reverse(), query);
            expect(reverse.map((task) => task.originalMarkdown)).toEqual(expectedOrder);
        }

        it.failing('should sort IN_PROGRESS before TODO', () => {
            expectSortsInExpectedOrder(
                ['- [ ] same description', '- [/] same description'],
                ['- [/] same description', '- [ ] same description'],
            );
        });

        it.failing('should earlier Due date first', () => {
            expectSortsInExpectedOrder(
                ['- [ ] same description 📅 2026-03-27', '- [ ] same description 📅 2026-01-07'],
                ['- [ ] same description 📅 2026-01-07', '- [ ] same description 📅 2026-03-27'],
            );
        });

        it.failing('should higher priority first', () => {
            expectSortsInExpectedOrder(
                ['- [ ] same description ⏫', '- [ ] same description 🔺'],
                ['- [ ] same description 🔺', '- [ ] same description ⏫'],
            );
        });
    });
});

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
        const modal = new QuickSearchTasksModal({} as any, () => tasks);
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

            const modal = new QuickSearchTasksModal({} as any, () => taskListWithGlobalFilter);
            const element = document.createElement('div');

            modal.renderSuggestion(taskListWithGlobalFilter[0], element);

            expect(getDescriptionTextContent(element)).toEqual(expectedDescription);
        },
    );

    it('should only check the checkbox for completed tasks', () => {
        const modal = new QuickSearchTasksModal({} as any, () => tasks);
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
