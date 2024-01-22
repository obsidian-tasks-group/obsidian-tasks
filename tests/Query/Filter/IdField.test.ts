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

    it('by id absence', () => {
        // Arrange
        const line = 'no id';
        const filter = new IdField().createFilterOrErrorMessage(line);
        expect(idField.canCreateFilterForLine(line)).toEqual(true);

        // Act, Assert
        testFilter(filter, new TaskBuilder().id(''), true);
        testFilter(filter, new TaskBuilder().id('abcdef'), false);
    });

    it('by id (includes)', () => {
        // Arrange
        const filter = new IdField().createFilterOrErrorMessage('id includes DEF');

        // Assert
        testFilter(filter, new TaskBuilder().id(''), false);
        testFilter(filter, new TaskBuilder().id('abcdef'), true);
    });

    it('by id (does not include)', () => {
        // Arrange
        const filter = new IdField().createFilterOrErrorMessage('id does not include def');

        // Assert
        testFilter(filter, new TaskBuilder().id(''), true);
        testFilter(filter, new TaskBuilder().id('abcdef'), false);
    });

    it('by id (regex matches)', () => {
        // Arrange
        const filter = new IdField().createFilterOrErrorMessage(String.raw`id regex matches /\d/`);

        // Assert
        testFilter(filter, new TaskBuilder().id(''), false);
        testFilter(filter, new TaskBuilder().id('a1'), true);
        testFilter(filter, new TaskBuilder().id('bc'), false);
    });

    it('by id (regex does not match)', () => {
        // Arrange
        const filter = new IdField().createFilterOrErrorMessage(String.raw`id regex does not match /\d/`);

        // Assert
        testFilter(filter, new TaskBuilder().id(''), true);
        testFilter(filter, new TaskBuilder().id('a1'), false);
        testFilter(filter, new TaskBuilder().id('bc'), true);
    });
});
