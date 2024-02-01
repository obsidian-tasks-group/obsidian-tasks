import { StatusNameField } from '../../../src/Query/Filter/StatusNameField';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { fromLine } from '../../TestingTools/TestHelpers';
import { SampleTasks } from '../../TestingTools/SampleTasks';

// Abbreviated names so that the markdown text is aligned
const todoTask = fromLine({ line: '- [ ] Xxx' });
const inprTask = fromLine({ line: '- [/] Xxx' });
const doneTask = fromLine({ line: '- [x] Xxx' });
const cancTask = fromLine({ line: '- [-] Xxx' });
const unknTask = fromLine({ line: '- [%] Xxx' });

describe('status.name', () => {
    it('value', () => {
        // Arrange
        const filter = new StatusNameField();

        // Assert
        expect(filter.value(todoTask)).toStrictEqual('Todo');
        expect(filter.value(inprTask)).toStrictEqual('In Progress');
        expect(filter.value(doneTask)).toStrictEqual('Done');
        expect(filter.value(cancTask)).toStrictEqual('Cancelled');
        expect(filter.value(unknTask)).toStrictEqual('Unknown');
    });

    it('status.name includes', () => {
        // Arrange
        const filter = new StatusNameField().createFilterOrErrorMessage('status.name includes todo');

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskFromLine('- [ ] Xxx');
        expect(filter).not.toMatchTaskFromLine('- [x] Xxx');
    });

    it('status-name is not valid', () => {
        // Arrange
        const filter = new StatusNameField().createFilterOrErrorMessage('status-name includes todo');

        // Assert
        // Check that the '.' in status.name is interpreted exactly as a dot.
        expect(filter).not.toBeValid();
    });
});

describe('sorting by status.name', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new StatusNameField();
        expect(field.supportsSorting()).toEqual(true);
    });

    it('should parse sort line correctly', () => {
        expect(new StatusNameField().createSorterFromLine('sort by status.name reverse')).not.toBeNull();
        expect(new StatusNameField().createSorterFromLine('sort by status-name reverse')).toBeNull();
    });

    it('sort by status.name', () => {
        // Arrange
        const sorter = new StatusNameField().createNormalSorter();

        // Assert
        expectTaskComparesEqual(sorter, cancTask, cancTask);
        // Reverse of Alphabetical order by status name
        expectTaskComparesBefore(sorter, cancTask, doneTask);
        expectTaskComparesBefore(sorter, doneTask, inprTask);
        expectTaskComparesBefore(sorter, inprTask, todoTask);
        expectTaskComparesBefore(sorter, todoTask, unknTask);
    });

    it('sort by status.name reverse', () => {
        // Arrange
        const sorter = new StatusNameField().createReverseSorter();

        // Assert
        expectTaskComparesEqual(sorter, cancTask, cancTask);
        // Alphabetical order by status name
        expectTaskComparesAfter(sorter, cancTask, doneTask);
        expectTaskComparesAfter(sorter, doneTask, inprTask);
        expectTaskComparesAfter(sorter, inprTask, todoTask);
        expectTaskComparesAfter(sorter, todoTask, unknTask);
    });
});

describe('grouping by status.name', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new StatusNameField()).toSupportGroupingWithProperty('status.name');
    });

    it('group by status.name', () => {
        // Arrange
        const grouper = new StatusNameField().createNormalGrouper();

        // // Assert
        expect({ grouper, tasks: [todoTask] }).groupHeadingsToBe(['Todo']);
        expect({ grouper, tasks: [inprTask] }).groupHeadingsToBe(['In Progress']);
    });

    it('should sort groups for StatusNameField', () => {
        const grouper = new StatusNameField().createNormalGrouper();
        const tasks = SampleTasks.withAllStatuses();

        expect({ grouper, tasks }).groupHeadingsToBe(['Cancelled', 'Done', 'EMPTY', 'In Progress', 'Non-Task', 'Todo']);
    });
});
