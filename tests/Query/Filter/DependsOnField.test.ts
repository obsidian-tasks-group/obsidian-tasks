import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { DependsOnField } from '../../../src/Query/Filter/DependsOnField';

describe('id', () => {
    const blockedByField = new DependsOnField();

    it('should supply field name', () => {
        expect(blockedByField.fieldName()).toEqual('blocked by');
    });

    it('by blocked by presence', () => {
        // Arrange
        const filter = new DependsOnField().createFilterOrErrorMessage('has depends on');

        // Act, Assert
        testFilter(filter, new TaskBuilder().dependsOn([]), false);
        testFilter(filter, new TaskBuilder().dependsOn(['abcdef']), true);
    });

    it('by blocked by absence', () => {
        // Arrange
        const line = 'no depends on';
        const filter = new DependsOnField().createFilterOrErrorMessage(line);
        expect(blockedByField.canCreateFilterForLine(line)).toEqual(true);

        // Act, Assert
        testFilter(filter, new TaskBuilder().dependsOn([]), true);
        testFilter(filter, new TaskBuilder().dependsOn(['abcdef']), false);
    });
});
