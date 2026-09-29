import moment from 'moment';
import {
    findTasksByDescription,
    findTasksByDescriptionSubstring,
    rankMatchingTasksByDescription,
} from '../../src/lib/QuickSearchTasks';
import { Status } from '../../src/Statuses/Status';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { fromLines } from '../TestingTools/TestHelpers';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import type { PresetsMap } from '../../src/Query/Presets/Presets';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import type { Task } from '../../src/Task/Task';

window.moment = moment;

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

    GlobalQuery.getInstance().reset();

    resetSettings();
});

describe('test data', () => {
    it('should keep the shared sample tasks alphabetical by description', () => {
        const descriptions = tasks.map((task) => task.description);
        expect(descriptions).toBeSorted();
    });
});

describe('search eligibility', () => {
    it('should return only incomplete tasks', () => {
        expect(findTasksByDescriptionSubstring(tasks, 'release')).toEqual([reviewRELEASEChecklist, writeReleaseNotes]);
    });

    it('should not show results until the user enters a search query', () => {
        expect(findTasksByDescriptionSubstring(tasks, '')).toHaveLength(0);
        expect(findTasksByDescriptionSubstring(tasks, '   ')).toHaveLength(0);
    });
});

describe('description matching', () => {
    it('should match descriptions ignoring case', () => {
        expect(findTasksByDescriptionSubstring(tasks, 'release')).toEqual([reviewRELEASEChecklist, writeReleaseNotes]);
    });

    it('should not match task tags', () => {
        expect(findTasksByDescriptionSubstring(tasks, '#release')).toEqual([]);
    });

    it.each([
        ['fuzzy matching finds a non-contiguous match', true, 'tdo', 1],
        ['fuzzy matching excludes a non-match', true, 'xyz', 0],
        ['substring matching finds a contiguous match', false, 'todo', 1],
        ['substring matching excludes a non-contiguous match', false, 'tdo', 0],
    ])('%s', (_, fuzzyMatching: boolean, query: string, expectedTaskCount: number) => {
        const task = new TaskBuilder().description('Todo task').build();
        updateSettings({ quickSearch: { fuzzyMatching } });

        expect(findTasksByDescription([task], query)).toHaveLength(expectedTaskCount);
    });
});

describe('Global Query integration', () => {
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

            const foundDescriptions = findTasksByDescriptionSubstring(tasks, query).map((task) => task.description);
            expect(foundDescriptions).toEqual(expectedFoundDescriptions);
        },
    );
});

describe('sorting matched tasks', () => {
    it('should rank fuzzy matches by score', () => {
        const closeMatch = new TaskBuilder().description('Todo task').build();
        const distantMatch = new TaskBuilder().description('Take documents out').build();
        const completedMatch = new TaskBuilder().description('Done task').status(Status.DONE).build();
        const scores = new Map([
            [closeMatch.descriptionWithoutTags, 2],
            [distantMatch.descriptionWithoutTags, 1],
            [completedMatch.descriptionWithoutTags, 3],
        ]);

        const results = rankMatchingTasksByDescription([distantMatch, completedMatch, closeMatch], (description) => {
            const score = scores.get(description);
            return score === undefined ? null : { score };
        });

        expect(results).toEqual([closeMatch, distantMatch]);
    });

    it('should use the normal Tasks order when matches compare equally', () => {
        const first = new TaskBuilder().description('A todo').build();
        const second = new TaskBuilder().description('B todo').build();

        const results = rankMatchingTasksByDescription([second, first], () => ({ score: 1 }));

        expect(results).toEqual([first, second]);
    });

    it.each([
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

        const foundDescriptions = findTasksByDescriptionSubstring(tasks, query).map((task) => task.description);
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
            tasks: readonly Task[],
            expectedOrder: string[],
            propertyGetter: (task: Task) => string,
        ): void {
            // Ensure we have enough tasks to make the test meaningful:
            expect(tasks.length).toBeGreaterThanOrEqual(2);

            // Ensure that all task.description values are identical, so we are definitely testing
            // the effect of other properties on the sort order:
            expect(new Set(tasks.map((task) => task.description)).size).toBe(1);

            const query = tasks[0].description;

            const result = findTasksByDescriptionSubstring(tasks, query);
            expect(result.map(propertyGetter)).toEqual(expectedOrder);

            // Repeat the sort, with the tasks initially in reverse order
            const reversedTasks = [...tasks].reverse();
            const reversedResult = findTasksByDescriptionSubstring(reversedTasks, query);
            expect(reversedResult.map(propertyGetter)).toEqual(expectedOrder);
        }

        it('should sort IN_PROGRESS before TODO', () => {
            expectSortsInExpectedOrder(
                ['- [ ] same description', '- [/] same description'],
                ['- [/] same description', '- [ ] same description'],
                (task: Task) => task.originalMarkdown,
            );
        });

        it('should sort earlier due date first', () => {
            expectSortsInExpectedOrder(
                ['- [ ] same description 📅 2026-03-27', '- [ ] same description 📅 2026-01-07'],
                ['- [ ] same description 📅 2026-01-07', '- [ ] same description 📅 2026-03-27'],
                (task: Task) => task.originalMarkdown,
            );
        });

        it('should sort higher priority first', () => {
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
