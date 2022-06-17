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
});
