import { PostponeMenu } from '../../../src/ui/Menus/PostponeMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TestableTaskSaver, menuToString } from './MenuTestingHelpers';

export {};

describe('PostponeMenu', () => {
    beforeEach(() => {
        TestableTaskSaver.reset();
    });

    it('should populate the menu', () => {
        // Arrange
        const task = new TaskBuilder().build();

        // Act
        const menu = new PostponeMenu(task);

        // Assert
        const itemsAsText = menuToString(menu);
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
            "
        `);
    });
});
