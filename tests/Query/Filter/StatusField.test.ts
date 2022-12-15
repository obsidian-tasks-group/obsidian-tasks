import { StatusField } from '../../../src/Query/Filter/StatusField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { Status } from '../../../src/Task';

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

    it('sort by status', () => {
        // Arrange
        const sorter = new StatusField().createSorter(false);

        // Assert
        expect(sorter.comparator(doneTask, todoTask)).toEqual(1);
    });

    it('sort by status reverse', () => {
        // Arrange
        const sorter = new StatusField().createSorter(true);

        // Assert
        expect(sorter.comparator(doneTask, todoTask)).toEqual(-1);
    });
});
