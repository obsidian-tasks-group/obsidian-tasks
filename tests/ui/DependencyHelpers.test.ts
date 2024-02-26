import { createTasksFromMarkdown } from '../TestingTools/TestHelpers';
import { searchForCandidateTasksForDependency } from '../../src/ui/DependencyHelpers';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';

function shouldOfferTheseCandidates(markdown: string, descriptionsOfCandidateTasks: string[]) {
    const allTasks = createTasksFromMarkdown(markdown, 'filename.md', 'header');
    const suggestions = searchForCandidateTasksForDependency('', allTasks, allTasks[0], [], []);

    expect(suggestions.map((task) => task.description)).toEqual(descriptionsOfCandidateTasks);
}

describe('searching for tasks', () => {
    beforeEach(() => {
        StatusRegistry.getInstance().resetToDefaultStatuses();
        const nonTaskStatus = new StatusConfiguration('Q', 'Question', 'A', true, StatusType.NON_TASK);
        StatusRegistry.getInstance().add(nonTaskStatus);
    });

    afterEach(() => {
        StatusRegistry.getInstance().resetToDefaultStatuses();
    });

    it('should show tasks other than the one being edited', () => {
        shouldOfferTheseCandidates(
            `
- [ ] Task being edited
- [ ] Some other task
`,
            ['Some other task'],
        );
    });

    it('does offer DONE, CANCELLED and NON_TASK tasks', () => {
        const markdown = `
- [ ] Task being edited
- [ ] Todo
- [/] In Progress
- [-] Cancelled
- [x] Done
- [Q] Non-Task
`;
        const allTasks = createTasksFromMarkdown(markdown, 'filename.md', 'header');
        const suggestions = searchForCandidateTasksForDependency('', allTasks, allTasks[0], [], []);

        expect(suggestions.map((task) => task.description)).toEqual([
            'Todo',
            'In Progress',
            'Cancelled',
            'Done',
            'Non-Task',
        ]);
    });
});
