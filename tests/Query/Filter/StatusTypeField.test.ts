import { StatusTypeField } from '../../../src/Query/Filter/StatusTypeField';
import * as TestHelpers from '../../TestHelpers';
import { toBeValid, toMatchTask, toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { StatusType } from '../../../src/StatusConfiguration';
import { Status } from '../../../src/Status';

expect.extend({
    toBeValid,
    toMatchTask,
    toMatchTaskFromLine,
});

// Abbreviated names so that the markdown text is aligned
const todoTask = TestHelpers.fromLine({ line: '- [ ] Xxx' });
const inprTask = TestHelpers.fromLine({ line: '- [/] Xxx' });
const doneTask = TestHelpers.fromLine({ line: '- [x] Xxx' });
const cancTask = TestHelpers.fromLine({ line: '- [-] Xxx' });
const unknTask = TestHelpers.fromLine({ line: '- [%] Xxx' });
const non_Task = new TaskBuilder().statusValues('^', 'non-task', 'x', false, StatusType.NON_TASK).build();
const emptTask = new TaskBuilder().status(Status.makeEmpty()).build();

describe('status.name', () => {
    it('value', () => {
        // Arrange
        const filter = new StatusTypeField();

        // Assert
        expect(filter.value(cancTask)).toStrictEqual('CANCELLED');
        expect(filter.value(doneTask)).toStrictEqual('DONE');
        expect(filter.value(inprTask)).toStrictEqual('IN_PROGRESS');
        expect(filter.value(non_Task)).toStrictEqual('NON_TASK');
        expect(filter.value(todoTask)).toStrictEqual('TODO');
        expect(filter.value(unknTask)).toStrictEqual('TODO');
    });

    it('status.type includes', () => {
        // Arrange
        const filter = new StatusTypeField().createFilterOrErrorMessage('status.type includes IN_PROGRESS');

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTask(inprTask);
        expect(filter).not.toMatchTask(todoTask);
    });

    it('status-name is not valid', () => {
        // Arrange
        const filter = new StatusTypeField().createFilterOrErrorMessage('status-type includes NON_TASK');

        // Assert
        // Check that the '.' in status.name is interpreted exactly as a dot.
        expect(filter).not.toBeValid();
    });
});

describe('sorting by status.name', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new StatusTypeField();
        expect(field.supportsSorting()).toEqual(true);
    });

    it('should parse sort line correctly', () => {
        expect(new StatusTypeField().createSorterFromLine('sort by status.type reverse')).not.toBeNull();
        expect(new StatusTypeField().createSorterFromLine('sort by status-type reverse')).toBeNull();
    });

    it('sort by status.name', () => {
        // Arrange
        const sorter = new StatusTypeField().createNormalSorter();

        // Assert
        expectTaskComparesEqual(sorter, cancTask, cancTask);
        expectTaskComparesEqual(sorter, todoTask, unknTask); // Unknown treated as TODO

        // Alphabetical order by status name
        expectTaskComparesBefore(sorter, cancTask, doneTask);
        expectTaskComparesBefore(sorter, doneTask, inprTask);
        expectTaskComparesBefore(sorter, inprTask, non_Task);
        expectTaskComparesBefore(sorter, non_Task, todoTask);

        // Users won't see empty tasks, but test them anyway
        expectTaskComparesBefore(sorter, doneTask, emptTask);
        expectTaskComparesBefore(sorter, emptTask, inprTask);
    });

    it('sort by status.name reverse', () => {
        // Arrange
        const sorter = new StatusTypeField().createReverseSorter();

        // Assert
        expectTaskComparesEqual(sorter, cancTask, cancTask);
        expectTaskComparesEqual(sorter, todoTask, unknTask); // Unknown treated as TODO

        // Reverse of Alphabetical order by status name
        expectTaskComparesAfter(sorter, cancTask, doneTask);
        expectTaskComparesAfter(sorter, doneTask, inprTask);
        expectTaskComparesAfter(sorter, inprTask, non_Task);
        expectTaskComparesAfter(sorter, non_Task, todoTask);

        // Users won't see empty tasks, but test them anyway
        expectTaskComparesAfter(sorter, doneTask, emptTask);
        expectTaskComparesAfter(sorter, emptTask, inprTask);
    });
});
