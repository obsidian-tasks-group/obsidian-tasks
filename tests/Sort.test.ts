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
import { DueDateField } from '../src/Query/Filter/DueDateField';
import { PathField } from '../src/Query/Filter/PathField';
import { fromLine } from './TestHelpers';
import { TaskBuilder } from './TestingTools/TaskBuilder';

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

    // Just a couple of tests to verify the handling of
    // composite sorts, and reverse sort order.

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
