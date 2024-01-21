import { DebugSettings } from '../../src/Config/DebugSettings';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { Query } from '../../src/Query/Query';
import { createTasksFromMarkdown } from '../TestingTools/TestHelpers';

describe('DebugSettings', () => {
    afterEach(() => {
        resetSettings();
    });

    it('should disable sorting instructions if', () => {
        // Arrange
        const tasksAsMarkdown = `
- [x] Task 1 - should not appear in output
- [x] Task 2 - should not appear in output
- [ ] Task 3 - will be sorted to 1st place, so should pass limit
`;
        const tasks = createTasksFromMarkdown(tasksAsMarkdown, 'some_markdown_file', 'Some Heading');

        const query = new Query(`
            sort by status
            explain
        `); // Would put Task 3 first

        // Disable sort instructions
        updateSettings({ debugSettings: new DebugSettings(true) });

        // Act
        const queryResult = query.applyQueryToTasks(tasks);

        // Assert
        expect(queryResult.groups.length).toEqual(1);
        const soleTaskGroup = queryResult.groups[0];
        // Check that the tasks are found in the original order, not the order in the sort instruction
        expect('\n' + soleTaskGroup.tasksAsStringOfLines()).toStrictEqual(tasksAsMarkdown);

        expect(query.explainQuery()).toMatchInlineSnapshot(`
            "No filters supplied. All tasks will match the query.

            No grouping instructions supplied.

            sort by status

            NOTE: All sort instructions, including default sort order, are disabled, due to 'ignoreSortInstructions' setting.
            "
        `);
    });
});
