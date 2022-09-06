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
