/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DoneDateField } from '../../../src/Query/Filter/DoneDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';

window.moment = moment;

function testTaskFilterForTaskWithDoneDate(filter: FilterOrErrorMessage, doneDate: string | null, expected: boolean) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.doneDate(doneDate), expected);
}

describe('done date', () => {
    it('by done date presence', () => {
        // Arrange
        const filter = new DoneDateField().createFilterOrErrorMessage('has done date');

        // Act, Assert
        testTaskFilterForTaskWithDoneDate(filter, null, false);
        testTaskFilterForTaskWithDoneDate(filter, '2022-04-15', true);
    });

    it('by done date absence', () => {
        // Arrange
        const filter = new DoneDateField().createFilterOrErrorMessage('no done date');

        // Act, Assert
        testTaskFilterForTaskWithDoneDate(filter, null, true);
        testTaskFilterForTaskWithDoneDate(filter, '2022-04-15', false);
    });
});
