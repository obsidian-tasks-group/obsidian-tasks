import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';
import { getSettings, updateSettings } from '../../../src/config/Settings';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestHelpers';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';

function testDescriptionFilter(
    filter: FilterOrErrorMessage,
    line: string,
    expected: boolean,
) {
    const task = fromLine({
        line,
    });
    testTaskFilter(filter, task, expected);
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchTaskWithDescription(description: string): R;
        }

        interface Expect {
            toMatchTaskWithDescription(description: string): any;
        }

        interface InverseAsymmetricMatchers {
            toMatchTaskWithDescription(description: string): any;
        }
    }
}

export function toMatchTaskWithDescription(
    filter: FilterOrErrorMessage,
    description: string,
) {
    const task = fromLine({
        line: description,
    });

    const matches = filter.filter!(task);
    if (!matches) {
        return {
            message: () => `unexpected failure to match task: ${description}`,
            pass: false,
        };
    }

    return {
        message: () => `filter should not have matched task: ${description}`,
        pass: true,
    };
}

expect.extend({
    toMatchTaskWithDescription,
});

describe('description', () => {
    it('ignores the global filter when filtering', () => {
        // Arrange
        const originalSettings = getSettings();
        updateSettings({ globalFilter: '#task' });
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description includes task',
        );

        // Act, Assert
        testDescriptionFilter(
            filter,
            '- [ ] #task this does not include the word; only in the global filter',

            false,
        );
        testDescriptionFilter(filter, '- [ ] #task this does: task', true);

        // Cleanup
        updateSettings(originalSettings);
    });

    it('works without a global filter', () => {
        // Arrange
        const originalSettings = getSettings();
        updateSettings({ globalFilter: '' });
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description includes task',
        );

        // Act, Assert
        testDescriptionFilter(
            filter,
            '- [ ] this does not include the word at all',
            false,
        );

        testDescriptionFilter(
            filter,
            '- [ ] #task this includes the word as a tag',
            true,
        );

        testDescriptionFilter(filter, '- [ ] #task this does: task', true);

        // Cleanup
        updateSettings(originalSettings);
    });

    it('works with regex', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex matches /^task/',
        );

        // Assert
        expect(filter).not.toMatchTaskWithDescription(
            '- [ ] this does not start with the pattern',
        );
        expect(filter).toMatchTaskWithDescription(
            '- [ ] task does start with the pattern',
        );
    });

    it('works negating regexes', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex does not match /^task/',
        );

        // Assert
        expect(filter).toMatchTaskWithDescription(
            '- [ ] this does not start with the pattern',
        );
        expect(filter).not.toMatchTaskWithDescription(
            '- [ ] task does start with the pattern',
        );
    });
});
