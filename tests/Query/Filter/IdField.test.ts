import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { IdField } from '../../../src/Query/Filter/IdField';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';

const idField = new IdField();

// Helper function to create a task with a given id
function with_id(id: string) {
    return new TaskBuilder().id(id).build();
}

describe('id', () => {
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

describe('sorting by id', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new IdField();
        expect(field.supportsSorting()).toEqual(true);
    });

    it('sort by id', () => {
        // Arrange
        const sorter = new IdField().createNormalSorter();

        // Assert
        expectTaskComparesEqual(sorter, with_id('mvplec'), with_id('mvplec'));
        expectTaskComparesBefore(sorter, with_id('g7317o'), with_id('rot7gb'));

        // Beginning with numbers
        expectTaskComparesBefore(sorter, with_id('1'), with_id('9'));
        expectTaskComparesBefore(sorter, with_id('9'), with_id('11'));
    });

    it('sort by id reverse', () => {
        // Single example just to prove reverse works.
        // (There's no need to repeat all the examples above)
        const sorter = new IdField().createReverseSorter();
        expectTaskComparesAfter(sorter, with_id('bbb'), with_id('ddd'));
    });
});

describe('grouping by id', () => {
    // Only minimal tests needed, as TextField is well covered by other tests
    it('supports grouping methods correctly', () => {
        expect(idField).toSupportGroupingWithProperty('id');
    });

    it('should group by id name', () => {
        const grouper = idField.createNormalGrouper();
        expect({ grouper, tasks: [with_id('')] }).groupHeadingsToBe([]);
        expect({ grouper, tasks: [with_id('rot7gb')] }).groupHeadingsToBe(['rot7gb']);
    });
});
