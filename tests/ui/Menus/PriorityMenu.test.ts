import { PriorityMenu } from '../../../src/ui/Menus/PriorityMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import type { MenuItem } from '../../__mocks__/obsidian';
import type { Task } from '../../../src/Task';
import { Priority } from '../../../src/Task';

export {};

function menuToString(menu: PriorityMenu) {
    // @ts-expect-error TS2339: Property 'items' does not exist on type 'PriorityMenu'.
    const items: MenuItem[] = menu.items;
    return '\n' + items.map((item) => `${item.checked ? 'x' : ' '} ${item.title}`).join('\n');
}

describe('PriorityMenu', () => {
    let taskBeingOverwritten: Task | undefined;
    let tasksBeingSaved: Task[] | undefined;

    async function testableTaskSaver(originalTask: Task, newTasks: Task | Task[]) {
        taskBeingOverwritten = originalTask;
        tasksBeingSaved = Array.isArray(newTasks) ? newTasks : [newTasks];
    }

    beforeEach(() => {
        taskBeingOverwritten = undefined;
        tasksBeingSaved = undefined;
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
        expect(taskBeingOverwritten).not.toBeUndefined();
        expect(Object.is(task, taskBeingOverwritten)).toEqual(true);
        expect(taskBeingOverwritten!.priority).toEqual(Priority.None);

        expect(tasksBeingSaved).not.toBeUndefined();
        expect(tasksBeingSaved!.length).toEqual(1);
        expect(tasksBeingSaved![0].priority).toEqual(Priority.Highest);
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
        expect(taskBeingOverwritten).toBeUndefined();
        expect(tasksBeingSaved).toBeUndefined();
    });
});
