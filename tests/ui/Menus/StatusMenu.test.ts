import { StatusMenu } from '../../../src/ui/Menus/StatusMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import type { MenuItem } from '../../__mocks__/obsidian';
import { StatusRegistry } from '../../../src/StatusRegistry';
import { StatusSettings } from '../../../src/Config/StatusSettings';
import { resetSettings, updateSettings } from '../../../src/Config/Settings';
import { StatusConfiguration, StatusType } from '../../../src/StatusConfiguration';

export {};

afterEach(() => {
    resetSettings();
});

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

    it('should ignore duplicate status symbols in global status settings', () => {
        // Arrange
        const statusSettings = new StatusSettings();
        statusSettings.customStatuses.push(new StatusConfiguration('%', '% 1', '&', false, StatusType.TODO));
        statusSettings.customStatuses.push(new StatusConfiguration('%', '% 2', '&', false, StatusType.TODO));
        updateSettings({
            statusSettings: statusSettings,
        });

        const statusRegistry = new StatusRegistry();
        StatusSettings.applyToStatusRegistry(statusSettings, statusRegistry);

        const task = new TaskBuilder().build();

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
            Change status to: [-] Cancelled
            Change status to: [%] % 1"
        `);
    });
});
