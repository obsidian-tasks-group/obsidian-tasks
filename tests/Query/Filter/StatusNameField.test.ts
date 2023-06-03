import { StatusNameField } from '../../../src/Query/Filter/StatusNameField';
import * as TestHelpers from '../../TestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import type { Task } from '../../../src/Task';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { Status } from '../../../src/Status';

// Abbreviated names so that the markdown text is aligned
const todoTask = TestHelpers.fromLine({ line: '- [ ] Xxx' });
const inprTask = TestHelpers.fromLine({ line: '- [/] Xxx' });
const doneTask = TestHelpers.fromLine({ line: '- [x] Xxx' });
const cancTask = TestHelpers.fromLine({ line: '- [-] Xxx' });
const unknTask = TestHelpers.fromLine({ line: '- [%] Xxx' });

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
        expect(grouper.grouper(todoTask)).toEqual(['Todo']);
        expect(grouper.grouper(inprTask)).toEqual(['In Progress']);
    });

    it('should sort groups for StatusNameField', () => {
        const grouper = new StatusNameField().createNormalGrouper();
        const tasks = withAllStatuses();

        expect({ grouper, tasks }).groupHeadingsToBe(['Cancelled', 'Done', 'EMPTY', 'In Progress', 'Todo']);
    });
});

function withAllStatuses(): Task[] {
    const statuses = [
        Status.makeCancelled(),
        Status.makeDone(),
        Status.makeEmpty(),
        Status.makeInProgress(),
        Status.makeTodo(),
    ];

    const tasks = statuses.map((status) => {
        return new TaskBuilder().status(status).build();
    });

    return tasks;
}
