import { StatusMenu } from '../../../src/ui/Menus/StatusMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import type { MenuItem } from '../../__mocks__/obsidian';
import { StatusRegistry } from '../../../src/StatusRegistry';

export {};

describe('StatusMenu', () => {
    it('creation', () => {
        // Arrange
        const task = new TaskBuilder().build();
        const statusRegistry = new StatusRegistry();

        // Act
        const menu = new StatusMenu(statusRegistry, task);

        // Assert
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'StatusMenu'.
        const items: MenuItem[] = menu.items;
        const itemsAsText = items.map((item) => item.title).join('\n');
        expect(itemsAsText).toMatchInlineSnapshot(`
            "Change status to: [ ] Todo
            Change status to: [x] Done
            Change status to: [/] In Progress
            Change status to: [-] Cancelled"
        `);
    });
});
