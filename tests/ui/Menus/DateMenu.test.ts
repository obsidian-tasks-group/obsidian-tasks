import { DateMenu } from '../../../src/ui/Menus/DateMenu';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { TestableTaskSaver, menuToString } from './MenuTestingHelpers';

export {};

describe('DateMenu', () => {
    beforeEach(() => {
        TestableTaskSaver.reset();
    });

    it('should populate a menu', () => {
        // Arrange
        const task = new TaskBuilder().build();

        // Act
        const menu = new DateMenu(task);

        // Assert
        const itemsAsText = menuToString(menu);
        expect(itemsAsText).toMatchInlineSnapshot(`
            "
            "
        `);
    });
});
