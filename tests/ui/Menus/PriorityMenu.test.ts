import { PriorityMenu } from '../../../src/ui/Menus/PriorityMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import type { Task } from '../../../src/Task';
import { Priority } from '../../../src/Task';
import { menuToString } from './MenuTestingHelpers';

export {};

class TestableTaskSaver {
    public static taskBeingOverwritten: Task | undefined;
    public static tasksBeingSaved: Task[] | undefined;

    static async testableTaskSaver(originalTask: Task, newTasks: Task | Task[]) {
        TestableTaskSaver.taskBeingOverwritten = originalTask;
        TestableTaskSaver.tasksBeingSaved = Array.isArray(newTasks) ? newTasks : [newTasks];
    }

    public static reset() {
        TestableTaskSaver.taskBeingOverwritten = undefined;
        TestableTaskSaver.tasksBeingSaved = undefined;
    }
}

describe('PriorityMenu', () => {
    beforeEach(() => {
        TestableTaskSaver.reset();
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
        const menu = new PriorityMenu(task, TestableTaskSaver.testableTaskSaver);

        // Act
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'PriorityMenu'.
        const todoItem = menu.items[0];
        expect(todoItem.title).toEqual('Priority: Highest');
        todoItem.callback();

        // Assert
        expect(TestableTaskSaver.taskBeingOverwritten).not.toBeUndefined();
        expect(Object.is(task, TestableTaskSaver.taskBeingOverwritten)).toEqual(true);
        expect(TestableTaskSaver.taskBeingOverwritten!.priority).toEqual(Priority.None);

        expect(TestableTaskSaver.tasksBeingSaved).not.toBeUndefined();
        expect(TestableTaskSaver.tasksBeingSaved!.length).toEqual(1);
        expect(TestableTaskSaver.tasksBeingSaved![0].priority).toEqual(Priority.Highest);
    });

    it('should not modify task, if current priority selected', () => {
        // Arrange
        const task = new TaskBuilder().priority(Priority.Highest).build();

        // Act
        const menu = new PriorityMenu(task, TestableTaskSaver.testableTaskSaver);

        // Act
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'PriorityMenu'.
        const todoItem = menu.items[0];
        expect(todoItem.title).toEqual('Priority: Highest');
        todoItem.callback();

        // Assert
        // testableTaskSaver() should never have been called, so the values
        // it saves should still be undefined:
        expect(TestableTaskSaver.taskBeingOverwritten).toBeUndefined();
        expect(TestableTaskSaver.tasksBeingSaved).toBeUndefined();
    });
});
