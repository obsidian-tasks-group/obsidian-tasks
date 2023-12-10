import { StatusMenu } from '../../../src/ui/Menus/StatusMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { MenuItem } from '../../__mocks__/obsidian';

export {};

describe('StatusMenu', () => {
    it('MenuItem', () => {
        const item = new MenuItem();
        expect(item.title).toEqual('');

        item.setTitle('hello');
        expect(item.title).toEqual('hello');
    });

    it('creation', () => {
        const task = new TaskBuilder().build();
        const menu = new StatusMenu(task);
        // @ts-expect-error TS2339: Property 'items' does not exist on type 'StatusMenu'.
        const items: MenuItem[] = menu.items;
        expect(items.length).toEqual(4);

        const itemsAsText = items.map((item) => item.title).join('\n');
        expect(itemsAsText).toMatchInlineSnapshot(`
            "Change status to:   Todo
            Change status to:   Done
            Change status to:   In Progress
            Change status to:   Cancelled"
        `);
    });
});
