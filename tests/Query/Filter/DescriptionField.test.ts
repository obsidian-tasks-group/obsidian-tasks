/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';
import { getSettings, updateSettings } from '../../../src/config/Settings';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestHelpers';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { toMatchTaskFromLine } from '../../CustomMatchers/CustomMatchersForFilters';

window.moment = moment;

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

expect.extend({
    toMatchTaskFromLine,
});

describe('description should strip signifiers, some duplicate spaces and trailing spaces', () => {
    const field = new DescriptionField();
    it('without global filter - all tags included', () => {
        // Arrange
        const task = fromLine({
            line: '- [ ]   Initial  description  ⏫  #tag1 ✅ 2022-08-12 #tag2/sub-tag ',
        });

        // Act, Assert
        // Multiple spaces before and in middle of description are retained.
        // Multiple spaces in middle of tags and signifiers are removed.
        // Signifiers are removed (priority, due date etc)
        // Trailing spaces are removed.
        expect(field.value(task)).toStrictEqual(
            'Initial  description #tag1 #tag2/sub-tag',
        );
    });

    it('with tag as global filter - all tags included', () => {
        // Arrange
        const originalSettings = getSettings();
        updateSettings({ globalFilter: '#task' });

        const task = fromLine({
            line: '- [ ] #task Initial  description  ⏫  #tag1 ✅ 2022-08-12 #tag2/sub-tag ',
        });

        // Act, Assert
        // Global filter tag is removed:
        expect(field.value(task)).toStrictEqual(
            'Initial  description #tag1 #tag2/sub-tag',
        );

        // Cleanup
        updateSettings(originalSettings);
    });

    it('with non-tag as global filter - all tags included', () => {
        // Arrange
        const originalSettings = getSettings();
        updateSettings({ globalFilter: 'global-filter' });

        const task = fromLine({
            line: '- [ ] global-filter Initial  description  ⏫  #tag1 ✅ 2022-08-12 #tag2/sub-tag ',
        });

        // Act, Assert
        // Global filter tag is removed:
        expect(field.value(task)).toStrictEqual(
            'Initial  description #tag1 #tag2/sub-tag',
        );

        // Cleanup
        updateSettings(originalSettings);
    });
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
        expect(filter).not.toMatchTaskFromLine(
            '- [ ] this does not start with the pattern',
        );
        expect(filter).toMatchTaskFromLine(
            '- [ ] task does start with the pattern',
        );
    });

    it('works negating regexes', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex does not match /^task/',
        );

        // Assert
        expect(filter).toMatchTaskFromLine(
            '- [ ] this does not start with the pattern',
        );
        expect(filter).not.toMatchTaskFromLine(
            '- [ ] task does start with the pattern',
        );
    });

    it('should find a time stamp in the description - simple version', () => {
        // Arrange
        // In code, 2 backslashes are needed to create a single `\`
        // In Obsidian, only one backslash is needed.
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex matches /\\d\\d:\\d\\d/',
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 23:59');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 00:01');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 99:99');
    });

    it('should find a time stamp in the description - more precise version', () => {
        // Arrange
        // In code, 2 backslashes are needed to create a single `\`
        // In Obsidian, only one backslash is needed.
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex matches /[012][0-9]:[0-5][0-9]/',
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 23:59');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 00:01');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do me at 99:99');
    });
});
