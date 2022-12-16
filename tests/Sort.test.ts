/**
 * @jest-environment jsdom
 */
import moment from 'moment';

window.moment = moment;

import type { Comparator } from '../src/Query/Sorting';
import { Sort } from '../src/Query/Sort';
import { Sorting } from '../src/Query/Sorting';
import { resetSettings, updateSettings } from '../src/Config/Settings';
import type { Task } from '../src/Task';
import { StatusField } from '../src/Query/Filter/StatusField';
import { DueDateField } from '../src/Query/Filter/DueDateField';
import { fromLine } from './TestHelpers';
import { TaskBuilder } from './TestingTools/TaskBuilder';
import {
    expectDateComparesAfter,
    expectDateComparesBefore,
    expectDateComparesEqual,
} from './CustomMatchers/CustomMatchersForSorting';

describe('Sort', () => {
    it('constructs Sorting both ways from Comparator function', () => {
        const comparator: Comparator = (a: Task, b: Task) => {
            if (a.description.length < b.description.length) {
                return 1;
            } else if (a.description.length > b.description.length) {
                return -1;
            } else {
                return 0;
            }
        };
        const short = new TaskBuilder().description('short').build();
        const long = new TaskBuilder().description('longer description').build();

        // Normal way round
        {
            const sortByDescriptionLength = new Sorting(false, 1, 'junk', comparator);
            expect(sortByDescriptionLength.comparator(short, long)).toEqual(1);
            expect(sortByDescriptionLength.comparator(short, short)).toEqual(0);
            expect(sortByDescriptionLength.comparator(long, short)).toEqual(-1);
        }

        // Reversed
        {
            const sortByDescriptionLength = new Sorting(true, 1, 'junk', comparator);
            expect(sortByDescriptionLength.comparator(short, long)).toEqual(-1);
            expect(sortByDescriptionLength.comparator(short, short)).toEqual(-0);
            expect(sortByDescriptionLength.comparator(long, short)).toEqual(1);
        }
    });

    it('sorts correctly by default order', () => {
        const one = fromLine({ line: '- [ ] a 📅 1970-01-01', path: '3' });
        const two = fromLine({ line: '- [ ] c 📅 1970-01-02', path: '3' });
        const three = fromLine({ line: '- [ ] d 📅 1970-01-03', path: '2' });
        const four = fromLine({ line: '- [x] d 📅 1970-01-02', path: '2' });
        const five = fromLine({ line: '- [x] b 📅 1970-01-02', path: '3' });
        const six = fromLine({ line: '- [x] d 📅 1970-01-03', path: '2' });
        const expectedOrder = [one, two, three, four, five, six];
        expect(Sort.by({ sorting: [] }, [six, five, one, four, two, three])).toEqual(expectedOrder);
    });

    // TODO Most of these will become redundant once each of the sort implementations
    //      is in a Field class, and the Field's tests exercise the particular sorting.
    //      Then the only testing needed here will probably be the testing of composite sorting.

    it('sorts correctly by due, path, status', () => {
        const one = fromLine({ line: '- [ ] a 📅 1970-01-01', path: '1' });
        const two = fromLine({ line: '- [ ] c 📅 1970-01-02', path: '1' });
        const three = fromLine({ line: '- [ ] d 📅 1970-01-02', path: '2' });
        const four = fromLine({ line: '- [x] b 📅 1970-01-02', path: '2' });
        const expectedOrder = [
            one, // Sort by due date first.
            two, // Same due as the rest, but lower path.
            three, // Same as b, but not done.
            four, // Done tasks are sorted after open tasks for status.
        ];
        expect(
            Sort.by(
                {
                    sorting: [
                        new DueDateField().createNormalSorter(),
                        Sort.makeLegacySorting(false, 1, 'path'),
                        new StatusField().createNormalSorter(),
                    ],
                },
                [one, four, two, three],
            ),
        ).toEqual(expectedOrder);
    });

    // TODO Replace this with something simpler but equivalent in DescriptionField.test.ts.
    it('sorts correctly by description, done', () => {
        const one = fromLine({
            line: '- [ ] a 📅 1970-01-02 ✅ 1971-01-01',
            path: '',
        });
        const two = fromLine({
            line: '- [ ] a 📅 1970-01-02 ✅ 1971-01-03',
            path: '',
        });
        const three = fromLine({
            line: '- [ ] b 📅 1970-01-01 ✅ 1971-01-01',
            path: '',
        });
        const four = fromLine({
            line: '- [ ] b 📅 1970-01-02 ✅ 1971-01-02',
            path: '',
        });
        const expectedOrder = [one, two, three, four];
        expect(
            Sort.by(
                {
                    sorting: [
                        Sort.makeLegacySorting(false, 1, 'description'),
                        Sort.makeLegacySorting(false, 1, 'done'),
                    ],
                },
                [three, one, two, four],
            ),
        ).toEqual(expectedOrder);
    });

    // TODO Replace this with something simpler but equivalent in DescriptionField.test.ts.
    it('sorts correctly by description reverse, done', () => {
        const one = fromLine({
            line: '- [ ] b 📅 1970-01-01 ✅ 1971-01-01',
            path: '',
        });
        const two = fromLine({
            line: '- [ ] b 📅 1970-01-02 ✅ 1971-01-02',
            path: '',
        });
        const three = fromLine({
            line: '- [ ] a 📅 1970-01-02 ✅ 1971-01-01',
            path: '',
        });
        const four = fromLine({
            line: '- [ ] a 📅 1970-01-02 ✅ 1971-01-03',
            path: '',
        });
        const expectedOrder = [one, two, three, four];
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(true, 1, 'description'), Sort.makeLegacySorting(false, 1, 'done')],
                },
                [two, four, three, one],
            ),
        ).toEqual(expectedOrder);
    });

    it('sorts correctly by complex sorting incl. reverse', () => {
        const one = fromLine({ line: '- [x] a 📅 1970-01-03', path: '3' });
        const two = fromLine({ line: '- [x] c 📅 1970-01-02', path: '2' });
        const three = fromLine({ line: '- [x] d 📅 1970-01-02', path: '3' });
        const four = fromLine({ line: '- [ ] d 📅 1970-01-02', path: '2' });
        const five = fromLine({ line: '- [ ] b 📅 1970-01-02', path: '3' });
        const six = fromLine({ line: '- [ ] d 📅 1970-01-01', path: '2' });

        const expectedOrder = [one, two, three, four, five, six];

        expect(
            Sort.by(
                {
                    sorting: [
                        new StatusField().createReverseSorter(),
                        new DueDateField().createReverseSorter(),
                        Sort.makeLegacySorting(false, 1, 'path'),
                    ],
                },
                [six, five, one, four, three, two],
            ),
        ).toEqual(expectedOrder);
    });

    // TODO Replace this with something simpler but equivalent in DescriptionField.test.ts.
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
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(false, 1, 'description')],
                },
                [two, one, five, four, three],
            ),
        ).toEqual(expectedOrder);
    });
});

// These are lower-level tests that the Task-based ones above, for ease of test coverage.
// TODO Replace this with something simpler but equivalent in the tests for DateField.test.ts.
describe('compareBy', () => {
    it('compares correctly by date', () => {
        const earlierDate = '2022-01-01';
        const laterDate = '2022-02-01';
        const invalidDate = '2022-02-30';

        expectDateComparesBefore(earlierDate, laterDate);
        expectDateComparesEqual(earlierDate, earlierDate);
        expectDateComparesAfter(laterDate, earlierDate);

        expectDateComparesAfter(null, earlierDate); // no date sorts after valid dates
        expectDateComparesEqual(null, null);

        expectDateComparesBefore(invalidDate, null); // invalid dates sort before no date
        expectDateComparesEqual(invalidDate, invalidDate);
        expectDateComparesAfter(invalidDate, earlierDate); // invalid dates sort after valid ones
    });
});

/*
 * All the test cases below have tasks with 0 or more tags against them. This is to
 * ensure that the sorting can handle the ordering correctly when there are no tags or
 * if one of th tasks has less tags than the other.
 *
 * There is also a task with additional characters in the name to ensure it is seen
 * as bigger that one with the same initial characters.
 */
// TODO Replace this with something simpler but equivalent in TagsField.test.ts.
describe('Sort by tags', () => {
    it('should sort correctly by tag defaulting to first with no global filter', () => {
        // Arrange
        const t1 = fromLine({ line: '- [ ] a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] a #bbb #iii' });
        const t3 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] a #ddd #ggg' });
        const t5 = fromLine({ line: '- [ ] a #eee #fff' });
        const t6 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t7 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t8 = fromLine({ line: '- [ ] a #hhh #eee' });
        const t9 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t10 = fromLine({ line: '- [ ] a #jjj #hhh' });
        const expectedOrder = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10];

        // Act / Assert
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(false, 1, 'tag')],
                },
                [t1, t3, t5, t7, t6, t4, t2, t8, t9, t10],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly reversed by tag defaulting to first with no global filter', () => {
        // Arrange
        const t1 = fromLine({ line: '- [ ] a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] a #bbb #iii' });
        const t3 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] a #ddd #ggg' });
        const t5 = fromLine({ line: '- [ ] a #eee #fff' });
        const t6 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t7 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t8 = fromLine({ line: '- [ ] a #hhh #eee' });
        const t9 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t10 = fromLine({ line: '- [ ] a #jjj #hhh' });
        const expectedOrder = [t10, t9, t8, t7, t6, t5, t4, t3, t2, t1];

        // Act / Assert
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(true, 1, 'tag')],
                },
                [t1, t3, t5, t7, t6, t4, t2, t8, t9, t10],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly by second tag with no global filter', () => {
        const t1 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t3 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t4 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t5 = fromLine({ line: '- [ ] a #hhh #eee' });
        const expectedOrder = [t1, t2, t3, t4, t5];
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(false, 2, 'tag')],
                },
                [t4, t3, t2, t1, t5],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly reversed by second tag with no global filter', () => {
        const t1 = fromLine({ line: '- [ ] a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] a #ccc #bbb' });
        const t3 = fromLine({ line: '- [ ] a #ggg #ccc' });
        const t4 = fromLine({ line: '- [ ] a #iii #ddd' });
        const t5 = fromLine({ line: '- [ ] a #hhh #eee' });
        const expectedOrder = [t5, t4, t3, t2, t1];
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(true, 2, 'tag')],
                },
                [t4, t3, t2, t1, t5],
            ),
        ).toEqual(expectedOrder);
    });

    it('should sort correctly by tag defaulting to first with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t4 = fromLine({ line: '- [ ] #task a #bbbb ' });
        const t5 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t6 = fromLine({ line: '- [ ] #task a #ddd #ggg' });
        const t7 = fromLine({ line: '- [ ] #task a #eee #fff' });
        const t8 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t9 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t10 = fromLine({ line: '- [ ] #task a #hhh #eee' });
        const t11 = fromLine({ line: '- [ ] #task a #iii #ddd' });
        const t12 = fromLine({ line: '- [ ] #task a #jjj #hhh' });
        const t13 = fromLine({ line: '- [ ] #task a' });

        const expectedOrder = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13];

        // Act
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(false, 1, 'tag')],
                },
                [t1, t12, t3, t13, t5, t7, t6, t4, t2, t8, t9, t10, t11],
            ),
        ).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });

    it('should sort correctly reversed by tag defaulting to first with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t4 = fromLine({ line: '- [ ] #task a #bbbb ' });
        const t5 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t6 = fromLine({ line: '- [ ] #task a #ddd #ggg' });
        const t7 = fromLine({ line: '- [ ] #task a #eee #fff' });
        const t8 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t9 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t10 = fromLine({ line: '- [ ] #task a #hhh #eee' });
        const t11 = fromLine({ line: '- [ ] #task a #iii #ddd' });
        const t12 = fromLine({ line: '- [ ] #task a #jjj #hhh' });
        const t13 = fromLine({ line: '- [ ] #task a' });

        const expectedOrder = [t13, t12, t11, t10, t9, t8, t7, t6, t5, t4, t3, t2, t1];

        // Act
        expect(
            Sort.by(
                {
                    sorting: [Sort.makeLegacySorting(true, 1, 'tag')],
                },
                [t1, t12, t3, t13, t5, t7, t6, t4, t2, t8, t9, t10, t11],
            ),
        ).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });

    it('should sort correctly by second tag with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t5 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t6 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t7 = fromLine({ line: '- [ ] #task a #bbbb' });
        const t8 = fromLine({ line: '- [ ] #task a' });
        const expectedOrder = [t1, t2, t3, t4, t5, t6, t7, t8];

        // Act
        const result = Sort.by(
            {
                sorting: [Sort.makeLegacySorting(false, 2, 'tag')],
            },
            [t4, t7, t5, t2, t3, t1, t8, t6],
        );

        // Assert
        expect(result).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });

    it('should sort correctly reversed by second tag with global filter', () => {
        // Arrange
        updateSettings({ globalFilter: '#task' });

        const t1 = fromLine({ line: '- [ ] #task a #fff #aaa' });
        const t2 = fromLine({ line: '- [ ] #task a #aaaa #aaaa' });
        const t3 = fromLine({ line: '- [ ] #task a #ccc #bbb' });
        const t4 = fromLine({ line: '- [ ] #task a #ggg #ccc' });
        const t5 = fromLine({ line: '- [ ] #task a #bbb #iii' });
        const t6 = fromLine({ line: '- [ ] #task a #aaa #jjj' });
        const t7 = fromLine({ line: '- [ ] #task a #bbbb' });
        const t8 = fromLine({ line: '- [ ] #task a' });
        const expectedOrder = [t8, t7, t6, t5, t4, t3, t2, t1];

        // Act
        const result = Sort.by(
            {
                sorting: [Sort.makeLegacySorting(true, 2, 'tag')],
            },
            [t4, t7, t5, t2, t3, t1, t8, t6],
        );

        // Assert
        expect(result).toEqual(expectedOrder);

        // Cleanup
        resetSettings();
    });
});
