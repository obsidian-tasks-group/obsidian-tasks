/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';
import { getSettings, updateSettings } from '../../../src/config/Settings';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestHelpers';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';
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
});

describe('search description for time stamps', () => {
    it('should find a time stamp in the description - simple version', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            String.raw`description regex matches /\d\d:\d\d/`,
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 23:59');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 00:01');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 99:99');
    });

    it('should find a time stamp in the description - more precise version', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex matches /[012][0-9]:[0-5][0-9]/',
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 23:59');
        expect(filter).toMatchTaskFromLine('- [ ] Do me at 00:01');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do me at 99:99');
    });
});

describe('search description for short tags, excluding sub-tags', () => {
    it('should search for a short tag anywhere in the line except the end', () => {
        // Arrange
        // \s is a whitespace character.
        // In regular text, it would match a newline character, so would find
        // text at the end of lines.
        // However, task descriptions do not have end-of-line characters,
        // so it does not match a tag at the end of the line.
        const filter = new DescriptionField().createFilterOrErrorMessage(
            String.raw`description regex matches /#t\s/i`,
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] #t Do stuff');
        expect(filter).toMatchTaskFromLine('- [ ] Do #t stuff');

        // Confirm that tags at end of line are not found. (See comments above.)
        expect(filter).not.toMatchTaskFromLine('- [ ] Do stuff #t');

        // Confirm that tags with sub-tags are not found:
        expect(filter).not.toMatchTaskFromLine('- [ ] #t/b Do stuff');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do #t/b stuff');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do stuff #t/b');
    });

    it('should search for a short tag at the end of the task', () => {
        // Arrange
        // $ is an end-of-input character.
        // So this search will find the given tag at the end of any task description
        const filter = new DescriptionField().createFilterOrErrorMessage(
            'description regex matches /#t$/i',
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do stuff #t');

        expect(filter).not.toMatchTaskFromLine('- [ ] #t Do stuff');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do #t stuff');

        // Confirm that tags with sub-tags are not found:
        expect(filter).not.toMatchTaskFromLine('- [ ] #t/b Do stuff');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do #t/b stuff');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do stuff #t/b');
    });

    it('should search for a short tag anywhere', () => {
        // Arrange
        const filter = new BooleanField().createFilterOrErrorMessage(
            String.raw`(description regex matches /#t\s/i) OR (description regex matches /#t$/i)`,
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] #t Do stuff');
        expect(filter).toMatchTaskFromLine('- [ ] Do #t stuff');
        expect(filter).toMatchTaskFromLine('- [ ] Do stuff #t');

        // Confirm that tags with sub-tags are not found:
        expect(filter).not.toMatchTaskFromLine('- [ ] #t/b Do stuff');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do #t/b stuff');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do stuff #t/b');
    });
});

describe('search description for sub-tags', () => {
    it('should search for a short tag anywhere', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            String.raw`description regex matches /#tag\/subtag[0-9]\/subsubtag[0-9]/i`,
        );

        // Assert
        expect(filter).toMatchTaskFromLine(
            '- [ ] Do stuff #tag/subtag3/subsubtag5',
        );
        expect(filter).not.toMatchTaskFromLine('- [ ] Do stuff #tag');
    });
});

describe('search description for Alternation (OR)', () => {
    it('should search for one of several spellings of waiting', () => {
        // Regex equivalent of:
        //      (description includes waiting) OR (description includes waits) OR (description includes wartet)
        // See https://obsidian-tasks-group.github.io/obsidian-tasks/queries/combining-filters/#finding-tasks-that-are-waiting

        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage(
            String.raw`description regex matches /waiting|waits|wartet/i`,
        );

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] Do stuff waiting');
        expect(filter).toMatchTaskFromLine('- [ ] Do stuff waits');
        expect(filter).toMatchTaskFromLine('- [ ] Do stuff wartet');
    });
});
