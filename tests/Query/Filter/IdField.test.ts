import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { IdField } from '../../../src/Query/Filter/IdField';

describe('id', () => {
    const idField = new IdField();

    it('should supply field name', () => {
        expect(idField.fieldName()).toEqual('id');
    });

    it('by id presence', () => {
        // Arrange
        const line = 'has id';
        const filter = new IdField().createFilterOrErrorMessage(line);
        expect(idField.canCreateFilterForLine(line)).toEqual(true);

        // Act, Assert
        testFilter(filter, new TaskBuilder().id(''), false);
        testFilter(filter, new TaskBuilder().id('abcdef'), true);
    });
});
