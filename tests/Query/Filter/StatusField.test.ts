import { StatusField } from '../../../src/Query/Filter/StatusField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { Status } from '../../../src/Status';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';

function testStatusFilter(filter: FilterOrErrorMessage, status: Status, expected: boolean) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.status(status), expected);
}

describe('status', () => {
    it('done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('done');

        // Assert
        testStatusFilter(filter, Status.TODO, false);
        testStatusFilter(filter, Status.DONE, true);
    });

    it('not done', () => {
        // Arrange
        const filter = new StatusField().createFilterOrErrorMessage('not done');

        // Assert
        testStatusFilter(filter, Status.TODO, true);
        testStatusFilter(filter, Status.DONE, false);
    });
});

describe('sorting by status', () => {
    const doneTask = new TaskBuilder().status(Status.DONE).build();
    const todoTask = new TaskBuilder().status(Status.TODO).build();

    it('supports Field sorting methods correctly', () => {
        const field = new StatusField();
        expect(field.supportsSorting()).toEqual(true);
    });

    it('sort by status', () => {
        // Arrange
        const sorter = new StatusField().createNormalSorter();

        // Assert
        expectTaskComparesAfter(sorter, doneTask, todoTask);
        expectTaskComparesBefore(sorter, todoTask, doneTask);
        expectTaskComparesEqual(sorter, doneTask, doneTask);
    });

    it('sort by status reverse', () => {
        // Arrange
        const sorter = new StatusField().createReverseSorter();

        // Assert
        expectTaskComparesBefore(sorter, doneTask, todoTask);
        expectTaskComparesAfter(sorter, todoTask, doneTask);
        expectTaskComparesEqual(sorter, doneTask, doneTask);
    });
});
