import moment from 'moment';
import { Notice } from 'obsidian';
import {
    QuickSearchTasksModal,
    filterIncompleteTasksByDescription,
    openTaskAtSourceLocation,
    saveFuzzyMatchingSetting,
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
import { getSettings, resetSettings, updateSettings } from '../../src/Config/Settings';
import type { Task } from '../../src/Task/Task';
import { QuickSearchOptionsModal } from '../../src/Obsidian/QuickSearchOptionsModal';

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

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-23'));
});

afterEach(() => {
    jest.useRealTimers();

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
        expect(filterIncompleteTasksByDescription(tasks, 'release', false)).toEqual([
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

    it('should limit ordinary text matches after applying the normal Tasks sort order', () => {
        expect(filterIncompleteTasksByDescription(tasks, 'release', false, 1)).toEqual([reviewRELEASEChecklist]);
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

            const foundDescriptions = filterIncompleteTasksByDescription(tasks, query, false).map(
                (task) => task.description,
            );
            expect(foundDescriptions).toEqual(expectedFoundDescriptions);
        },
    );
});

describe('Finding matching tasks with fuzzy search', () => {
    it('should support non-contiguous description matches', () => {
        const task = new TaskBuilder().description('Todo task').build();

        expect(filterIncompleteTasksByDescription([task], 'tdo', false)).toEqual([]);
        expect(filterIncompleteTasksByDescription([task], 'tdo', true)).toEqual([task]);
    });

    it('should only return incomplete tasks', () => {
        const incomplete = new TaskBuilder().description('Todo task').build();
        const completed = new TaskBuilder().description('Todo task').status(Status.DONE).build();

        expect(filterIncompleteTasksByDescription([completed, incomplete], 'tdo', true)).toEqual([incomplete]);
    });

    it('should honour the Global Query', () => {
        GlobalQuery.getInstance().set('description includes Write');

        expect(filterIncompleteTasksByDescription(tasks, 'wrl', true)).toEqual([writeReleaseNotes]);
    });

    it('should rank closer fuzzy matches first', () => {
        const closeMatch = new TaskBuilder().description('Todo task').build();
        const distantMatch = new TaskBuilder().description('Take documents out').build();

        expect(filterIncompleteTasksByDescription([distantMatch, closeMatch], 'tdo', true)).toEqual([
            closeMatch,
            distantMatch,
        ]);
    });

    it('should use the normal Tasks sort order when fuzzy scores are equal', () => {
        const first = new TaskBuilder().description('A todo').build();
        const second = new TaskBuilder().description('B todo').build();

        expect(filterIncompleteTasksByDescription([second, first], 'todo', true)).toEqual([first, second]);
    });

    it('should retain only the highest-ranked fuzzy matches when a result limit is supplied', () => {
        const closeMatch = new TaskBuilder().description('Todo task').build();
        const distantMatch = new TaskBuilder().description('Take documents out').build();

        expect(filterIncompleteTasksByDescription([distantMatch, closeMatch], 'tdo', true, 1)).toEqual([closeMatch]);
    });

    it('should honour the normal Tasks sort order when limiting equal-scoring fuzzy matches', () => {
        const first = new TaskBuilder().description('A todo').build();
        const second = new TaskBuilder().description('B todo').build();

        expect(filterIncompleteTasksByDescription([second, first], 'todo', true, 1)).toEqual([first]);
    });
});

describe('Configuring fuzzy search', () => {
    function addObsidianElementMethods<T extends HTMLElement>(element: T): T {
        return Object.assign(element, {
            addClass: (...classes: string[]) => element.classList.add(...classes),
            setText: (text: string) => {
                element.textContent = text;
            },
            empty: () => element.replaceChildren(),
        });
    }

    it('should enable fuzzy matching by default', () => {
        expect(getSettings().searchTasks.fuzzyMatching).toBe(true);
    });

    it('should use the saved fuzzy matching setting in the Quick Search modal', () => {
        const task = new TaskBuilder().description('Todo task').build();
        const modal = new QuickSearchTasksModal(
            {} as any,
            () => [task],
            async () => {},
        );

        expect(modal.getSuggestions('tdo')).toEqual([task]);

        updateSettings({ searchTasks: { fuzzyMatching: false } });

        expect(modal.getSuggestions('tdo')).toEqual([]);
    });

    it('should reuse prepared candidates while the task cache and Global Query remain unchanged', () => {
        const task = new TaskBuilder().description('Todo task').build();
        const currentTasks = [task];
        const getTasks = jest.fn(() => currentTasks);
        const modal = new QuickSearchTasksModal({} as any, getTasks, async () => {});

        expect(modal.getSuggestions('tdo')).toEqual([task]);
        expect(modal.getSuggestions('todo')).toEqual([task]);
        expect(getTasks).toHaveBeenCalledTimes(2);

        modal.onClose();
        expect(modal.getSuggestions('tdo')).toEqual([task]);
        expect(getTasks).toHaveBeenCalledTimes(3);
    });

    it('should refresh prepared candidates when the task cache changes', () => {
        const originalTask = new TaskBuilder().description('Original task').build();
        const updatedTask = new TaskBuilder().description('Updated task').build();
        let currentTasks = [originalTask];
        const modal = new QuickSearchTasksModal(
            {} as any,
            () => currentTasks,
            async () => {},
        );

        expect(modal.getSuggestions('original')).toEqual([originalTask]);

        currentTasks = [updatedTask];
        expect(modal.getSuggestions('updated')).toEqual([updatedTask]);
        expect(modal.getSuggestions('original')).toEqual([]);
    });

    it('should refresh prepared candidates when the Global Query changes', () => {
        const includedTask = new TaskBuilder().description('Included task').build();
        const excludedTask = new TaskBuilder().description('Excluded task').build();
        const currentTasks = [includedTask, excludedTask];
        const modal = new QuickSearchTasksModal(
            {} as any,
            () => currentTasks,
            async () => {},
        );

        expect(modal.getSuggestions('task')).toEqual([excludedTask, includedTask]);

        updateSettings({ globalQuery: 'description includes Included' });
        GlobalQuery.getInstance().set('description includes Included');
        expect(modal.getSuggestions('task')).toEqual([includedTask]);
    });

    it('should narrow fuzzy-search candidates as the query is extended', () => {
        const releaseTask = new TaskBuilder().description('Release notes').build();
        const roadmapTask = new TaskBuilder().description('Road map').build();
        const currentTasks = [releaseTask, roadmapTask];
        const modal = new QuickSearchTasksModal(
            {} as any,
            () => currentTasks,
            async () => {},
        );
        const roadmapDescription = jest.spyOn(roadmapTask, 'descriptionWithoutTags', 'get');

        modal.getSuggestions('r');
        modal.getSuggestions('re');
        const callsAfterRoadmapStoppedMatching = roadmapDescription.mock.calls.length;

        expect(modal.getSuggestions('rel')).toEqual([releaseTask]);
        expect(roadmapDescription).toHaveBeenCalledTimes(callsAfterRoadmapStoppedMatching);
    });

    it('should save a changed setting and refresh the current search', async () => {
        const onSaveSettings = jest.fn().mockResolvedValue(undefined);
        const searchInput = document.createElement('input');
        const onInput = jest.fn();
        searchInput.addEventListener('input', onInput);

        await saveFuzzyMatchingSetting(false, onSaveSettings, searchInput);

        expect(getSettings().searchTasks.fuzzyMatching).toBe(false);
        expect(onSaveSettings).toHaveBeenCalledTimes(1);
        expect(onInput).toHaveBeenCalledTimes(1);
    });

    it('should restore the previous setting and refresh the search if saving fails', async () => {
        const error = new Error('Could not save settings');
        const searchInput = document.createElement('input');
        const onInput = jest.fn();
        searchInput.addEventListener('input', onInput);

        await expect(saveFuzzyMatchingSetting(false, async () => Promise.reject(error), searchInput)).rejects.toBe(
            error,
        );

        expect(getSettings().searchTasks.fuzzyMatching).toBe(true);
        expect(onInput).toHaveBeenCalledTimes(1);
    });

    it('should expose Quick Search options from a settings button', () => {
        const openOptions = jest.spyOn(QuickSearchOptionsModal.prototype, 'open').mockImplementation();
        const modal = new QuickSearchTasksModal(
            {} as any,
            () => tasks,
            async () => {},
        );
        const modalElement = addObsidianElementMethods(document.createElement('div'));
        const inputContainer = addObsidianElementMethods(document.createElement('div'));
        const inputElement = document.createElement('input');
        inputContainer.appendChild(inputElement);
        modalElement.appendChild(inputContainer);
        Object.assign(modal, {
            modalEl: modalElement,
            inputEl: inputElement,
        });

        modal.onOpen();

        const optionsButton = modalElement.querySelector<HTMLButtonElement>('[aria-label="Quick search options"]');
        expect(optionsButton).not.toBeNull();
        expect(optionsButton?.getAttribute('test-icon')).toBe('settings');
        optionsButton?.click();
        expect(openOptions).toHaveBeenCalledTimes(1);
        openOptions.mockRestore();
    });

    it('should render the saved value in the Quick Search options modal and report changes', async () => {
        const onChange = jest.fn().mockResolvedValue(undefined);
        const modal = new QuickSearchOptionsModal({ app: {} as any, fuzzyMatching: true, onChange });
        const contentElement = addObsidianElementMethods(document.createElement('div'));
        Object.assign(modal, {
            titleEl: addObsidianElementMethods(document.createElement('div')),
            modalEl: addObsidianElementMethods(document.createElement('div')),
            contentEl: contentElement,
        });

        modal.onOpen();

        expect(contentElement.textContent).toContain('Fuzzy search');
        const toggle = contentElement.querySelector<HTMLInputElement>('input[type="checkbox"]');
        expect(toggle?.checked).toBe(true);

        if (toggle !== null) {
            toggle.checked = false;
            toggle.dispatchEvent(new Event('change'));
        }
        await Promise.resolve();

        expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should prevent another fuzzy-search change while the previous change is being saved', async () => {
        let finishSaving: (() => void) | undefined;
        const onChange = jest.fn(
            async () =>
                new Promise<void>((resolve) => {
                    finishSaving = resolve;
                }),
        );
        const modal = new QuickSearchOptionsModal({ app: {} as any, fuzzyMatching: true, onChange });
        const contentElement = addObsidianElementMethods(document.createElement('div'));
        Object.assign(modal, {
            titleEl: addObsidianElementMethods(document.createElement('div')),
            modalEl: addObsidianElementMethods(document.createElement('div')),
            contentEl: contentElement,
        });
        modal.onOpen();

        const toggle = contentElement.querySelector<HTMLInputElement>('input[type="checkbox"]');
        expect(toggle).not.toBeNull();
        if (toggle === null) {
            return;
        }

        toggle.checked = false;
        toggle.dispatchEvent(new Event('change'));
        expect(toggle.disabled).toBe(true);

        toggle.click();
        expect(onChange).toHaveBeenCalledTimes(1);

        finishSaving?.();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(toggle.disabled).toBe(false);
    });
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

        const foundDescriptions = filterIncompleteTasksByDescription(tasks, query, false).map(
            (task) => task.description,
        );
        expect(foundDescriptions).toEqual(expectedFoundDescriptions);
    });

    describe('handling identical descriptions', () => {
        function expectSortsInExpectedOrder(
            lines: string[],
            expectedOrder: string[],
            propertyGetter: (task: Task) => string,
        ): void {
            const tasks = fromLines({ lines });
            expectSortsTasksInExpectedOrder(tasks, expectedOrder, propertyGetter);
        }

        function expectSortsTasksInExpectedOrder(
            tasks: Task[],
            expectedOrder: string[],
            propertyGetter: (task: Task) => string,
        ): void {
            // Ensure we have enough tasks to make the test meaningful:
            expect(tasks.length).toBeGreaterThanOrEqual(2);

            // Ensure that all task.description values are identical, so we are definitely testing
            // the effect of other properties on the sort order:
            expect(new Set(tasks.map((task) => task.description)).size).toBe(1);

            const query = tasks[0].description;

            const result = filterIncompleteTasksByDescription(tasks, query, false);
            expect(result.map(propertyGetter)).toEqual(expectedOrder);

            // Repeat the sort, with the tasks initially in reverse order
            const reverse = filterIncompleteTasksByDescription(tasks.reverse(), query, false);
            expect(reverse.map(propertyGetter)).toEqual(expectedOrder);
        }

        it('should sort IN_PROGRESS before TODO', () => {
            expectSortsInExpectedOrder(
                ['- [ ] same description', '- [/] same description'],
                ['- [/] same description', '- [ ] same description'],
                (task: Task) => task.originalMarkdown,
            );
        });

        it('should earlier Due date first', () => {
            expectSortsInExpectedOrder(
                ['- [ ] same description 📅 2026-03-27', '- [ ] same description 📅 2026-01-07'],
                ['- [ ] same description 📅 2026-01-07', '- [ ] same description 📅 2026-03-27'],
                (task: Task) => task.originalMarkdown,
            );
        });

        it('should higher priority first', () => {
            expectSortsInExpectedOrder(
                ['- [ ] same description ⏫', '- [ ] same description 🔺'],
                ['- [ ] same description 🔺', '- [ ] same description ⏫'],
                (task: Task) => task.originalMarkdown,
            );
        });

        it('should sort by path', () => {
            const paths = ['x/y/z.md', 'a/b/c.md'];
            const tasks = paths.map((path) => new TaskBuilder().path(path).build());

            const expectedOrder = ['a/b/c.md', 'x/y/z.md'];

            expectSortsTasksInExpectedOrder(tasks, expectedOrder, (task: Task) => task.path);
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
        const modal = new QuickSearchTasksModal(
            {} as any,
            () => tasks,
            async () => {},
        );
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

            const modal = new QuickSearchTasksModal(
                {} as any,
                () => taskListWithGlobalFilter,
                async () => {},
            );
            const element = document.createElement('div');

            modal.renderSuggestion(taskListWithGlobalFilter[0], element);

            expect(getDescriptionTextContent(element)).toEqual(expectedDescription);
        },
    );

    it('should only check the checkbox for completed tasks', () => {
        const modal = new QuickSearchTasksModal(
            {} as any,
            () => tasks,
            async () => {},
        );
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
