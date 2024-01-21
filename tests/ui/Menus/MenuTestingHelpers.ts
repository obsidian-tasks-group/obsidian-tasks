import type { MenuItem } from '../../__mocks__/obsidian';
import type { Task } from '../../../src/Task/Task';

export function menuToString<MenuType>(menu: MenuType) {
    // @ts-expect-error TS2339: Property 'items' does not exist on type 'MenuType'.
    const items: MenuItem[] = menu.items;
    return '\n' + items.map((item) => `${item.checked ? 'x' : ' '} ${item.title}`).join('\n');
}

export class TestableTaskSaver {
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
