import { HeadingField } from '../../../src/Query/Filter/HeadingField';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import {
    toBeValid,
    toMatchTaskWithHeading,
} from '../../CustomMatchers/CustomMatchersForFilters';

function testTaskFilterForHeading(
    filter: FilterOrErrorMessage,
    precedingHeader: string | null,
    expected: boolean,
) {
    const builder = new TaskBuilder();
    testFilter(filter, builder.precedingHeader(precedingHeader), expected);
}

expect.extend({
    toBeValid,
});

expect.extend({
    toMatchTaskWithHeading,
});

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

    it('by heading (regex matches - case sensitive)', () => {
        // Arrange
        const filter = new HeadingField().createFilterOrErrorMessage(
            'heading regex matches /[Ii]nteresting Head.ng/',
        );

        // Act, Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithHeading('Interesting Heading');
        expect(filter).not.toMatchTaskWithHeading(null);
        expect(filter).not.toMatchTaskWithHeading('SoMe InteResting HeaDing');
    });

    it('by heading (regex does not match - case in-sensitive)', () => {
        // Arrange
        const filter = new HeadingField().createFilterOrErrorMessage(
            'heading regex does not match /[Ii]nteresting Head.ng/i',
        );

        // Act, Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithHeading(null);
        expect(filter).not.toMatchTaskWithHeading('Interesting Heading');
        expect(filter).not.toMatchTaskWithHeading('SoMe InteResting HeaDing');
    });
});
