import { StatusTypeField } from '../../../src/Query/Filter/StatusTypeField';
import * as TestHelpers from '../../TestHelpers';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { StatusType } from '../../../src/StatusConfiguration';
import { Status } from '../../../src/Status';
import * as FilterParser from '../../../src/Query/FilterParser';

// Abbreviated names so that the markdown text is aligned
const todoTask = TestHelpers.fromLine({ line: '- [ ] Todo' });
const inprTask = TestHelpers.fromLine({ line: '- [/] In progress' });
const doneTask = TestHelpers.fromLine({ line: '- [x] Done' });
const cancTask = TestHelpers.fromLine({ line: '- [-] Cancelled' });
const unknTask = TestHelpers.fromLine({ line: '- [%] Unknown' });
const non_Task = new TaskBuilder()
    .statusValues('^', 'non-task', 'x', false, StatusType.NON_TASK)
    .description('Non-task')
    .build();
const emptTask = new TaskBuilder().status(Status.makeEmpty()).description('Empty task').build();

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

    it('status.type is', () => {
        // Arrange
        const filter = new StatusTypeField().createFilterOrErrorMessage('status.type is IN_PROGRESS');

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTask(inprTask);
        expect(filter).not.toMatchTask(todoTask);
    });

    it('status.type is not', () => {
        // Arrange
        const filter = new StatusTypeField().createFilterOrErrorMessage('status.type is not IN_PROGRESS');

        // Assert
        expect(filter).toBeValid();
        expect(filter).not.toMatchTask(inprTask);
        expect(filter).toMatchTask(todoTask);
    });

    it('status.type is - works with incorrect case', () => {
        // Arrange
        const filter = new StatusTypeField().createFilterOrErrorMessage('status.type is in_progress');

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTask(inprTask);
        expect(filter).not.toMatchTask(todoTask);
    });

    it('status-name is not valid', () => {
        // Arrange
        const filter = new StatusTypeField().createFilterOrErrorMessage('status-type is NON_TASK');

        // Assert
        // Check that the '.' in status.name is interpreted exactly as a dot.
        expect(filter).not.toBeValid();
    });

    it('status.name with invalid line is parsed and user sees helpful message', () => {
        // Arrange
        const filter = FilterParser.parseFilter('status.type gobbledygook');

        // Assert
        expect(filter).not.toBeValid();
        expect(filter?.error).toMatchInlineSnapshot(`
            "Invalid status.type instruction: 'status.type gobbledygook'.
                Allowed options: 'is' and 'is not' (without quotes).
                Allowed values:  TODO DONE IN_PROGRESS CANCELLED NON_TASK
                                 Note: values are case-insensitive,
                                       so 'in_progress' works too, for example.
                Example:         status.type is not NON_TASK"
        `);
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

        // Most actionable type first..
        expectTaskComparesBefore(sorter, inprTask, todoTask);
        expectTaskComparesBefore(sorter, todoTask, doneTask);
        expectTaskComparesBefore(sorter, doneTask, cancTask);
        expectTaskComparesBefore(sorter, cancTask, non_Task);

        // Users won't see empty tasks, but test them anyway
        expectTaskComparesBefore(sorter, doneTask, emptTask);
        expectTaskComparesAfter(sorter, emptTask, inprTask);
    });

    it('sort by status.name reverse', () => {
        // Arrange
        const sorter = new StatusTypeField().createReverseSorter();

        // Assert
        expectTaskComparesEqual(sorter, cancTask, cancTask);
        expectTaskComparesEqual(sorter, todoTask, unknTask); // Unknown treated as TODO

        // Reverse of  order by status name
        expectTaskComparesAfter(sorter, inprTask, todoTask);
        expectTaskComparesAfter(sorter, todoTask, doneTask);
        expectTaskComparesAfter(sorter, doneTask, cancTask);
        expectTaskComparesAfter(sorter, cancTask, non_Task);

        // Users won't see empty tasks, but test them anyway
        expectTaskComparesAfter(sorter, doneTask, emptTask);
        expectTaskComparesBefore(sorter, emptTask, inprTask);
    });
});

describe('grouping by status.type', () => {
    it('supports Field grouping methods correctly', () => {
        expect(new StatusTypeField()).toSupportGroupingWithProperty('status.type');
    });

    it('group by status.type', () => {
        // Arrange
        const grouper = new StatusTypeField().createGrouper();

        // // Assert
        expect(grouper.grouper(inprTask)).toEqual(['1 IN_PROGRESS']);
        expect(grouper.grouper(todoTask)).toEqual(['2 TODO']);
        expect(grouper.grouper(unknTask)).toEqual(['2 TODO']);
        expect(grouper.grouper(doneTask)).toEqual(['3 DONE']);
        expect(grouper.grouper(cancTask)).toEqual(['4 CANCELLED']);
        expect(grouper.grouper(non_Task)).toEqual(['5 NON_TASK']);
        expect(grouper.grouper(emptTask)).toEqual(['6 EMPTY']); // won't be seen by users
    });
});
