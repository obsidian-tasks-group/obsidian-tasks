import { createTasksFromMarkdown } from '../TestingTools/TestHelpers';
import { searchForCandidateTasksForDependency } from '../../src/ui/DependencyHelpers';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';

function offersTheseCandidates(markdown: string, descriptionsOfCandidateTasks: string[]) {
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
        offersTheseCandidates(
            `
                - [ ] Task being edited
                - [ ] Some other task
            `,
            ['Some other task'],
        );
    });

    it('should not offer DONE, CANCELLED and NON_TASK tasks', () => {
        offersTheseCandidates(
            `
                - [ ] Task being edited
                - [ ] Todo
                - [/] In Progress
                - [-] Cancelled
                - [x] Done
                - [Q] Non-Task
            `,
            ['Todo', 'In Progress'],
        );
    });
});
