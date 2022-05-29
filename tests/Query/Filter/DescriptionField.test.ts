import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';
import { getSettings, updateSettings } from '../../../src/Settings';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestHelpers';

describe('description', () => {
    it('can instantiate', () => {
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description includes wibble',
        );
        expect(filter.filter).toBeDefined();
        expect(filter.error).toBeUndefined();
    });

    it('ignores the global filter when filtering', () => {
        // Arrange
        const originalSettings = getSettings();
        updateSettings({ globalFilter: '#task' });
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description includes task',
        );

        // Act, Assert
        testTaskFilter(
            filter,
            fromLine({
                line: '- [ ] #task this does not include the word; only in the global filter',
            })!,
            false,
        );
        testTaskFilter(
            filter,
            fromLine({ line: '- [ ] #task this does: task' })!,
            true,
        );

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
        testTaskFilter(
            filter,
            fromLine({
                line: '- [ ] this does not include the word at all',
            })!,
            false,
        );

        testTaskFilter(
            filter,
            fromLine({
                line: '- [ ] #task this includes the word as a tag',
            })!,
            true,
        );

        testTaskFilter(
            filter,
            fromLine({
                line: '- [ ] #task this does: task',
            })!,
            true,
        );

        // Cleanup
        updateSettings(originalSettings);
    });
});
