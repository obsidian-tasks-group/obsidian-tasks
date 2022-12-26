/**
 * @jest-environment jsdom
 */
import moment from 'moment';

window.moment = moment;

import type { Comparator } from '../src/Query/Sorter';
import { Sort } from '../src/Query/Sort';
import { Sorter } from '../src/Query/Sorter';
import type { Task } from '../src/Task';
import { StatusField } from '../src/Query/Filter/StatusField';
import { DoneDateField } from '../src/Query/Filter/DoneDateField';
import { DueDateField } from '../src/Query/Filter/DueDateField';
import { PathField } from '../src/Query/Filter/PathField';
import { DescriptionField } from '../src/Query/Filter/DescriptionField';
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
            const sortByDescriptionLength = new Sorter('junk', comparator, false);
            expect(sortByDescriptionLength.comparator(short, long)).toEqual(1);
            expect(sortByDescriptionLength.comparator(short, short)).toEqual(0);
            expect(sortByDescriptionLength.comparator(long, short)).toEqual(-1);
        }

        // Reversed
        {
            const sortByDescriptionLength = new Sorter('junk', comparator, true);
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
        expect(Sort.by([], [six, five, one, four, two, three])).toEqual(expectedOrder);
    });

    // TODO Add some tests based on easy-to-reason-about custom comparators, then delete the remaining old-style tests
    //  - Basic sorting with a single comparator
    //  - Nested sorting with 2 more more comparators

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
                [
                    new DueDateField().createNormalSorter(),
                    new PathField().createNormalSorter(),
                    new StatusField().createNormalSorter(),
                ],
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
                [new DescriptionField().createNormalSorter(), new DoneDateField().createNormalSorter()],
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
                [new DescriptionField().createReverseSorter(), new DoneDateField().createNormalSorter()],
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
                [
                    new StatusField().createReverseSorter(),
                    new DueDateField().createReverseSorter(),
                    new PathField().createNormalSorter(),
                ],
                [six, five, one, four, three, two],
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
