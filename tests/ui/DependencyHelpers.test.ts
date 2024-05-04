import { createTasksFromMarkdown } from '../TestingTools/TestHelpers';
import { searchForCandidateTasksForDependency } from '../../src/ui/DependencyHelpers';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import type { Task } from '../../src/Task/Task';

function offersTheseCandidatesForTasks(
    taskBeingEdited: Task,
    allTasks: Task[],
    descriptionsOfCandidateTasks: string[],
) {
    const blockedBy: Task[] = [];

    // TODO: Put this code in somewhere that it is tested and re-usable:
    for (const taskId of taskBeingEdited.dependsOn) {
        const depTask = allTasks.find((cacheTask) => cacheTask.id === taskId);
        if (depTask) {
            blockedBy.push(depTask);
        }
    }

    // TODO: Put this code in somewhere that it is tested and re-usable:
    const blocking: Task[] = allTasks.filter((t) => t.dependsOn.includes(taskBeingEdited.id));

    const suggestions = searchForCandidateTasksForDependency('', allTasks, taskBeingEdited, blockedBy, blocking);

    expect(suggestions.map((task) => task.description)).toEqual(descriptionsOfCandidateTasks);
}

function offersTheseCandidates(markdown: string, descriptionsOfCandidateTasks: string[]) {
    const allTasks = createTasksFromMarkdown(markdown, 'filename.md', 'header');
    offersTheseCandidatesForTasks(allTasks[0], allTasks, descriptionsOfCandidateTasks);
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

    it('should sort files in same file before those in others', () => {
        // Arrange
        const taskInOtherFile = createTasksFromMarkdown(
            `
                - [ ] Task from other file - should be offered after task from file being edited
            `,
            'other file.md',
            'header',
        );
        const tasksInFileBeingEdited = createTasksFromMarkdown(
            `
                - [ ] Task being edited
                - [ ] In same file as task being edited - should be offered first
            `,
            'this file.md',
            'header',
        );

        const allTasks = [...taskInOtherFile].concat(tasksInFileBeingEdited);
        // Check that task from other file is first, to avoid passing by luck:
        expect(allTasks[0]).toBe(taskInOtherFile[0]);

        // Act, Assert:
        offersTheseCandidatesForTasks(tasksInFileBeingEdited[0], allTasks, [
            'In same file as task being edited - should be offered first',
            'Task from other file - should be offered after task from file being edited',
        ]);
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

    it('should exclude tasks which depend on the edited task', () => {
        offersTheseCandidates(
            `
                - [ ] Task being edited 🆔 12345
                - [ ] Depends on task being edited️ ⛔ 12345
                - [ ] Does not depend on task being edited️
            `,
            ['Does not depend on task being edited️'],
        );
    });

    it('should exclude tasks which the task being edited depends on', () => {
        offersTheseCandidates(
            `
                - [ ] Task being edited ⛔ 12345
                - [ ] Task being edited️ depends on this 🆔 12345
                - [ ] Is not depended on by the task being edited
            `,
            ['Is not depended on by the task being edited'],
        );
    });
});
