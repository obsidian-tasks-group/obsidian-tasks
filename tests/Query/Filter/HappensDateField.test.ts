/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { HappensDateField } from '../../../src/Query/Filter/HappensDateField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';

window.moment = moment;

function testTaskFilterForTaskWithHappensDate(
    filter: FilterOrErrorMessage,
    dueDate: string | null,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testTaskFilter(filter, builder.dueDate(dueDate).build(), expected);
}

describe('happens date', () => {
    it('by happens date presence', () => {
        // Arrange
        const filter = new HappensDateField().createFilterOrErrorMessage(
            'has happens date',
        );

        // Act, Assert
        testTaskFilterForTaskWithHappensDate(filter, null, false);
        testTaskFilterForTaskWithHappensDate(filter, '2022-04-15', true);
    });

    it('by happens date absence', () => {
        // Arrange
        const filter = new HappensDateField().createFilterOrErrorMessage(
            'no happens date',
        );

        // Act, Assert
        testTaskFilterForTaskWithHappensDate(filter, null, true);
        testTaskFilterForTaskWithHappensDate(filter, '2022-04-15', false);
    });
});
