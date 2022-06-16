import { HeadingField } from '../../../src/Query/Filter/HeadingField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';

function testTaskFilterForHeading(
    filter: FilterOrErrorMessage,
    precedingHeader: string | null,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.precedingHeader(precedingHeader), expected);
}

describe('heading', () => {
    it('by heading (includes)', () => {
        // Arrange
        const filter = new HeadingField().createFilterOrErrorMessage(
            'heading includes Interesting Heading',
        );

        // Act, Assert
        testTaskFilterForHeading(filter, null, false);
        testTaskFilterForHeading(filter, 'An InteResting HeaDing', true);
        testTaskFilterForHeading(filter, 'Other Heading', false);
    });

    it('by heading (does not include)', () => {
        // Arrange
        const filter = new HeadingField().createFilterOrErrorMessage(
            'heading does not include Interesting Heading',
        );

        // Act, Assert
        testTaskFilterForHeading(filter, null, true);
        testTaskFilterForHeading(filter, 'SoMe InteResting HeaDing', false);
        testTaskFilterForHeading(filter, 'Other Heading', true);
    });
});
