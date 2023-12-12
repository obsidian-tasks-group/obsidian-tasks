import { PriorityMenu } from '../../../src/ui/Menus/PriorityMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import type { Task } from '../../../src/Task';
import { Priority } from '../../../src/Task';
import { menuToString } from './MenuTestingHelpers';

export {};

class TestableTaskSaver {
    public taskBeingOverwritten: Task | undefined;
    public tasksBeingSaved: Task[] | undefined;
}

describe('PriorityMenu', () => {
    const taskSaver = new TestableTaskSaver();

    async function testableTaskSaver(originalTask: Task, newTasks: Task | Task[]) {
        taskSaver.taskBeingOverwritten = originalTask;
        taskSaver.tasksBeingSaved = Array.isArray(newTasks) ? newTasks : [newTasks];
    }

    beforeEach(() => {
        taskSaver.taskBeingOverwritten = undefined;
        taskSaver.tasksBeingSaved = undefined;
    });

    it('should show checkmark against the current task priority', () => {
        // Arrange
        const task = new TaskBuilder().build();

        // Act
        const menu = new PriorityMenu(task);

        // Assert
        const itemsAsText = menuToString(menu);
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
              Priority: Highest
              Priority: High
              Priority: Medium
            x Priority: Normal
              Priority: Low
              Priority: Lowest"
        `);
    });

    it('should modify task, if different priority selected', () => {
        // Arrange
        const task = new TaskBuilder().build();
        const menu = new PriorityMenu(task, testableTaskSaver);

        // Act
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'PriorityMenu'.
        const todoItem = menu.items[0];
        expect(todoItem.title).toEqual('Priority: Highest');
        todoItem.callback();

        // Assert
        expect(taskSaver.taskBeingOverwritten).not.toBeUndefined();
        expect(Object.is(task, taskSaver.taskBeingOverwritten)).toEqual(true);
        expect(taskSaver.taskBeingOverwritten!.priority).toEqual(Priority.None);

        expect(taskSaver.tasksBeingSaved).not.toBeUndefined();
        expect(taskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(taskSaver.tasksBeingSaved![0].priority).toEqual(Priority.Highest);
    });

    it('should not modify task, if current priority selected', () => {
        // Arrange
        const task = new TaskBuilder().priority(Priority.Highest).build();

        // Act
        const menu = new PriorityMenu(task, testableTaskSaver);

        // Act
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'PriorityMenu'.
        const todoItem = menu.items[0];
        expect(todoItem.title).toEqual('Priority: Highest');
        todoItem.callback();

        // Assert
        // testableTaskSaver() should never have been called, so the values
        // it saves should still be undefined:
        expect(taskSaver.taskBeingOverwritten).toBeUndefined();
        expect(taskSaver.tasksBeingSaved).toBeUndefined();
    });
});
