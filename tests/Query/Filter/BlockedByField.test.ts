import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { BlockedByField } from '../../../src/Query/Filter/BlockedByField';

describe('id', () => {
    const blockedByField = new BlockedByField();

    it('should supply field name', () => {
        expect(blockedByField.fieldName()).toEqual('blocked by');
    });

    it('by blocked by presence', () => {
        // Arrange
        const filter = new BlockedByField().createFilterOrErrorMessage('has blocked by');

        // Act, Assert
        testFilter(filter, new TaskBuilder().blockedBy([]), false);
        testFilter(filter, new TaskBuilder().blockedBy(['abcdef']), true);
    });
});
