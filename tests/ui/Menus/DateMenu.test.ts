import { DateMenu } from '../../../src/ui/Menus/DateMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TaskLayoutComponent } from '../../../src/Layout/TaskLayoutOptions';
import { TestableTaskSaver, menuToString } from './MenuTestingHelpers';

export {};

describe('DateMenu', () => {
    beforeEach(() => {
        TestableTaskSaver.reset();
    });

    it('should populate a menu for a specific field', () => {
        // Arrange
        const task = new TaskBuilder().build();

        // Act
        const field = TaskLayoutComponent.DoneDate;
        const menu = new DateMenu(field, task);

        // Assert
        const itemsAsText = menuToString(menu);
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
            "
        `);
    });
});
