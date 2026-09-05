import moment from 'moment';

import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { Priority } from '../../src/Task/Priority';
import { taskSearchMetadataText, taskSearchSuggestionText } from '../../src/ui/QuickSearchTasksModal';
import { QuickSearchTasksModal } from '../../src/Commands/QuickSearchTasks';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { Status } from '../../src/Statuses/Status';
import { fromMarkdown } from '../TestingTools/TestHelpers';

window.moment = moment;

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
        expect(
            taskSearchSuggestionText(
                new TaskBuilder()
                    .description('Write release notes')
                    .path('Projects/Release.md')
                    .lineNumber(12)
                    .precedingHeader('Preparation')
                    .build(),
            ),
        ).toEqual({
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
