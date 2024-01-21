/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';
import { GlobalFilter } from '../../../src/Config/GlobalFilter';
import { testTaskFilter } from '../../TestingTools/FilterTestHelpers';
import { fromLine } from '../../TestingTools/TestHelpers';
import type { FilterOrErrorMessage } from '../../../src/Query/Filter/FilterOrErrorMessage';
import { BooleanField } from '../../../src/Query/Filter/BooleanField';
import {
    expectTaskComparesAfter,
    expectTaskComparesBefore,
    expectTaskComparesEqual,
} from '../../CustomMatchers/CustomMatchersForSorting';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { sortBy } from '../../TestingTools/SortingTestHelpers';

window.moment = moment;

function testDescriptionFilter(filter: FilterOrErrorMessage, line: string, expected: boolean) {
    const task = fromLine({
        line,
    });
    testTaskFilter(filter, task, expected);
}

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
        expect(field.value(task)).toStrictEqual('Initial  description #tag1 #tag2/sub-tag');
    });

    it('with tag as global filter - all tags included', () => {
        // Arrange
        GlobalFilter.getInstance().set('#task');

        const task = fromLine({
            line: '- [ ] #task Initial  description  ⏫  #tag1 ✅ 2022-08-12 #tag2/sub-tag ',
        });

        // Act, Assert
        // Global filter tag is removed:
        expect(field.value(task)).toStrictEqual('Initial  description #tag1 #tag2/sub-tag');

        // Cleanup
        GlobalFilter.getInstance().reset();
    });

    it('with non-tag as global filter - all tags included', () => {
        // Arrange
        GlobalFilter.getInstance().set('global-filter');

        const task = fromLine({
            line: '- [ ] global-filter Initial  description  ⏫  #tag1 ✅ 2022-08-12 #tag2/sub-tag ',
        });

        // Act, Assert
        // Global filter tag is removed:
        expect(field.value(task)).toStrictEqual('Initial  description #tag1 #tag2/sub-tag');

        // Cleanup
        GlobalFilter.getInstance().reset();
    });
});

describe('description', () => {
    it('ignores the global filter when filtering', () => {
        // Arrange
        GlobalFilter.getInstance().set('#task');
        const filter = new DescriptionField().createFilterOrErrorMessage('description includes task');

        // Act, Assert
        testDescriptionFilter(
            filter,
            '- [ ] #task this does not include the word; only in the global filter',

            false,
        );
        testDescriptionFilter(filter, '- [ ] #task this does: task', true);

        // Cleanup
        GlobalFilter.getInstance().reset();
    });

    it('works without a global filter', () => {
        // Arrange
        GlobalFilter.getInstance().set('');
        const filter = new DescriptionField().createFilterOrErrorMessage('description includes task');

        // Act, Assert
        testDescriptionFilter(filter, '- [ ] this does not include the word at all', false);

        testDescriptionFilter(filter, '- [ ] #task this includes the word as a tag', true);

        testDescriptionFilter(filter, '- [ ] #task this does: task', true);

        // Cleanup
        GlobalFilter.getInstance().reset();
    });

    it('works with regex', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage('description regex matches /^task/');

        // Assert
        expect(filter).not.toMatchTaskFromLine('- [ ] this does not start with the pattern');
        expect(filter).toMatchTaskFromLine('- [ ] task does start with the pattern');
    });

    it('works negating regexes', () => {
        // Arrange
        const filter = new DescriptionField().createFilterOrErrorMessage('description regex does not match /^task/');

        // Assert
        expect(filter).toMatchTaskFromLine('- [ ] this does not start with the pattern');
        expect(filter).not.toMatchTaskFromLine('- [ ] task does start with the pattern');
    });
});

// begin-snippet: example_test_of_filters
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
// end-snippet

describe('search description for short tags, excluding sub-tags', () => {
    // Note that the following were written before tag searches supported regex.
    // They would now be written using:
    //  tag regex matches /#t$/i
    it('should search for a short tag anywhere in the line except the end', () => {
        // Arrange
        // \s is a whitespace character.
        // In regular text, it would match a newline character, so would find
        // text at the end of lines.
        // However, task descriptions do not have end-of-line characters,
        // so it does not match a tag at the end of the line.
        const filter = new DescriptionField().createFilterOrErrorMessage(String.raw`description regex matches /#t\s/i`);

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
        const filter = new DescriptionField().createFilterOrErrorMessage('description regex matches /#t$/i');

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
        expect(filter).toMatchTaskFromLine('- [ ] Do stuff #tag/subtag3/subsubtag5');
        expect(filter).not.toMatchTaskFromLine('- [ ] Do stuff #tag');
    });
});

describe('search description for Alternation (OR)', () => {
    it('should search for one of several spellings of waiting', () => {
        // Regex equivalent of:
        //      (description includes waiting) OR (description includes waits) OR (description includes wartet)
        // See https://publish.obsidian.md/tasks/Queries/Combining+Filters#Finding+tasks+that+are+waiting

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

describe('sorting by description', () => {
    it('supports Field sorting methods correctly', () => {
        const field = new DescriptionField();
        expect(field.supportsSorting()).toEqual(true);
    });

    // Helper function to create a task with a given path
    function with_description(description: string) {
        return new TaskBuilder().description(description).build();
    }

    it('sort by description', () => {
        // Arrange
        const sorter = new DescriptionField().createNormalSorter();

        // Assert
        expectTaskComparesEqual(sorter, with_description('Aaa'), with_description('Aaa'));
        expectTaskComparesBefore(sorter, with_description('AAA'), with_description('ZZZ'));

        // Ignores case if strings differ
        expectTaskComparesBefore(sorter, with_description('AAA'), with_description('bbb'));
        expectTaskComparesBefore(sorter, with_description('aaa'), with_description('BBB'));
        expectTaskComparesBefore(sorter, with_description('aaa'), with_description('AAA'));

        // Sorts text with numbers in correctly
        expectTaskComparesBefore(sorter, with_description('9 x'), with_description('11 x'));
        expectTaskComparesBefore(sorter, with_description('x 9'), with_description('x 11'));
    });

    it('sort by description reverse', () => {
        // Single example just to prove reverse works.
        // (There's no need to repeat all the examples above)
        const sorter = new DescriptionField().createReverseSorter();
        expectTaskComparesAfter(sorter, with_description('AAA'), with_description('ZZZ'));
    });

    describe('show how markdown in descriptions gets cleaned', () => {
        const sorter = new DescriptionField().createNormalSorter();

        it('characters that are not stripped out', () => {
            // expectTaskComparesBefore() shows that the initial * is not removed removed
            expectTaskComparesBefore(
                sorter,
                new TaskBuilder()
                    .description('*ZZZ Initial lone asterisk is not stripped, so these two tasks sort unequal')
                    .build(),
                new TaskBuilder()
                    .description('ZZZ Initial lone asterisk is not stripped, so these two tasks sort unequal')
                    .build(),
            );
        });

        // All the strings should be treated as though they contain 'un-format'
        it.each([
            '*un-format*',
            '**un-format**',
            '_un-format_',
            '__un-format__',
            '[[un-format]]',
            '[[some-other-file-name|un-format]]',
            '[un-format]',
            '==un-format==',
        ])('simple description "%s" is cleaned to "un-format"', (originalDescription: string) => {
            expect(DescriptionField.cleanDescription(originalDescription)).toStrictEqual('un-format');
        });

        // Each of these pairs of strings is:
        // 1. A task description
        // 2. The result of running that description through the description-cleaning code.
        it.each([
            [
                '[[Better be second]] most [] removed so these sort equal',
                'Better be second most [] removed so these sort equal',
            ],
            [
                '[[Another|Third it should be]] alias is used from 1st link but not 2nd [last|ZZZ]',
                'Third it should be alias is used from 1st link but not 2nd [last|ZZZ]',
            ],
            [
                '*Very italic text*', // (comment to override formatting)
                'Very italic text',
            ],
            [
                '[@Zebra|Zebra] alias is used single []*', // (comment to override formatting)
                'Zebra alias is used single []*',
            ],
            [
                '==highlighted== then ordinary text', // (comment to override formatting)
                'highlighted then ordinary text',
            ],

            [
                '=non-highlighted= then ordinary text', // (comment to override formatting)
                '=non-highlighted= then ordinary text',
            ],
            [
                '**bold** then ordinary text', // (comment to override formatting)
                'bold then ordinary text',
            ],
            [
                '*italic* then ordinary text', // (comment to override formatting)
                'italic then ordinary text',
            ],
        ])('description "%s" is cleaned to "%s"', (originalDescription: string, cleanedDescription: string) => {
            expect(DescriptionField.cleanDescription(originalDescription)).toStrictEqual(cleanedDescription);
            expectTaskComparesEqual(
                sorter,
                new TaskBuilder().description(originalDescription).build(),
                new TaskBuilder().description(cleanedDescription).build(),
            );
        });
    });

    // All the strings are expected to be treated as unchanged.
    // They typically have unbalanced numbers of formatting characters,
    // or other behaviours not yet supported by Description.
    it.each([
        '**originalDescription* following text',
        '__originalDescription_ following text',
        '**hello * world** - formatting character inside formatting', // it would be nice for this to become 'hello * world'
        '=un-format= single hyphen is not a valid formatting, so do not remove it',
    ])('description "%s" is unchanged when cleaned"', (originalDescription: string) => {
        expect(DescriptionField.cleanDescription(originalDescription)).toStrictEqual(originalDescription);
    });

    it('sorts correctly by the link name and not the markdown', () => {
        const one = fromLine({
            line: '- [ ] *ZZZ An early task that starts with an A; actually not italic since only one asterisk',
        });
        const two = fromLine({
            line: '- [ ] [[Better be second]] with bla bla behind it',
        });
        const three = fromLine({
            line: '- [ ] [[Another|Third it should be]] and not [last|ZZZ]',
        });
        const four = fromLine({
            line: '- [ ] *Very italic text*',
        });
        const five = fromLine({
            line: '- [ ] [@Zebra|Zebra] should be last for Zebra',
        });

        const expectedOrder = [one, two, three, four, five];
        expect(sortBy([new DescriptionField().createNormalSorter()], [two, one, five, four, three])).toEqual(
            expectedOrder,
        );
    });
});
