/**
 * @jest-environment jsdom
 */
import moment from 'moment';

window.moment = moment;

import type { Comparator } from '../src/Query/Sorting';
import { Sort } from '../src/Query/Sort';
import { Sorting } from '../src/Query/Sorting';
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
