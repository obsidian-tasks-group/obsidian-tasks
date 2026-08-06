/**
 * @jest-environment jsdom
 */
import moment from 'moment';

window.moment = moment;

import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import type { Comparator } from '../../../src/Query/Sort/Sorter';
import { Sorter } from '../../../src/Query/Sort/Sorter';
import type { Task } from '../../../src/Task/Task';
import { StatusField } from '../../../src/Query/Filter/StatusField';
import { DueDateField } from '../../../src/Query/Filter/DueDateField';
import { PathField } from '../../../src/Query/Filter/PathField';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import { Sort } from '../../../src/Query/Sort/Sort';
import { StatusRegistry } from '../../../src/Statuses/StatusRegistry';
import { StatusConfiguration, StatusType } from '../../../src/Statuses/StatusConfiguration';
import { fromLine, fromLines, toLines } from '../../TestingTools/TestHelpers';
import { SampleTasks } from '../../TestingTools/SampleTasks';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { sortBy } from '../../TestingTools/SortingTestHelpers';
import { verifyWithFileExtension } from '../../TestingTools/ApprovalTestHelpers';

const longAgo = '2022-01-01';
const yesterday = '2022-01-14';
const today = '2022-01-15';
const tomorrow = '2022-01-16';
const farFuture = '2022-01-31';
const invalid = '2022-13-33';

beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(today));
});

afterAll(() => {
    jest.useRealTimers();
});

afterEach(() => {
    StatusRegistry.getInstance().resetToDefaultStatuses();
});

function verifySortedTasks(tasks: Task[]) {
    const sortedTasks = Sort.by([], tasks, SearchInfo.fromAllTasks(tasks));
    verify(toLines(sortedTasks).join('\n'));
}

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

        const searchInfo = SearchInfo.fromAllTasks([short, long]);

        // Normal way round
        {
            const sortByDescriptionLength = new Sorter('sort by description length', 'junk', comparator, false);
            expect(sortByDescriptionLength.comparator(short, long, searchInfo)).toEqual(1);
            expect(sortByDescriptionLength.comparator(short, short, searchInfo)).toEqual(0);
            expect(sortByDescriptionLength.comparator(long, short, searchInfo)).toEqual(-1);
        }

        // Reversed
        {
            const sortByDescriptionLength = new Sorter('sort by description length reverse', 'junk', comparator, true);
            expect(sortByDescriptionLength.comparator(short, long, searchInfo)).toEqual(-1);
            expect(sortByDescriptionLength.comparator(short, short, searchInfo)).toEqual(-0);
            expect(sortByDescriptionLength.comparator(long, short, searchInfo)).toEqual(1);
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
        expect(sortBy([], [six, five, one, four, two, three])).toEqual(expectedOrder);
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
            sortBy(
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
            sortBy(
                [
                    new StatusField().createReverseSorter(),
                    new DueDateField().createReverseSorter(),
                    new PathField().createNormalSorter(),
                ],
                [six, five, one, four, three, two],
            ),
        ).toEqual(expectedOrder);
    });

    it('save default sort order', () => {
        const sorters = Sort.defaultSorters();
        const defaultSortInstructions = sorters.map((sorter) => sorter.instruction).join('\n');
        verifyWithFileExtension(defaultSortInstructions, 'text');
    });

    it('visualise default sort order', () => {
        StatusRegistry.getInstance().add(new StatusConfiguration('^', 'Non-task', ' ', false, StatusType.NON_TASK));

        const extraTaskLines = `- [x] #task Done        🔺 📅 1970-01-02
- [/] #task In progress 🔺 📅 1970-01-02
- [-] #task Cancelled   🔺 📅 1970-01-02`;
        const extraTasks = fromLines({ lines: extraTaskLines.split('\n') });
        const tasks = SampleTasks.withAllRepresentativeDueDates()
            .concat(SampleTasks.withAllRepresentativeStartDates())
            .concat(SampleTasks.withAllRepresentativeScheduledDates())
            .concat(SampleTasks.withAllPriorities())
            .concat(SampleTasks.withAllStatusTypes())
            .concat(SampleTasks.withAllRootsPathsHeadings())
            .concat(extraTasks);
        verifySortedTasks(tasks);
    });

    it('visualise date impact on default sort order', () => {
        const dates = [
            ['long ago', longAgo],
            ['yesterday', yesterday],
            ['today', today],
            ['tomorrow', tomorrow],
            ['far future', farFuture],
            ['', null],
            ['invalid', invalid],
        ];
        const tasks: Task[] = [];
        function pad(date: string) {
            return date.padEnd(12);
        }

        function addDateIfSet(emoji: string, date: any) {
            let dateIfSet = '';
            if (date) {
                dateIfSet = ` ${emoji} ${date}`;
            }
            return dateIfSet;
        }

        for (const start of dates) {
            for (const scheduled of dates) {
                for (const due of dates) {
                    const description = `Start: ${pad(start[0]!)} Scheduled: ${pad(scheduled[0]!)} Due: ${pad(
                        due[0]!,
                    )}`;

                    let dateFields = '';
                    dateFields += addDateIfSet('🛫', start[1]);
                    dateFields += addDateIfSet('⏳', scheduled[1]);
                    dateFields += addDateIfSet('📅', due[1]);

                    const line = `- [ ] ${description}`;
                    const task = fromLine({ line: line + dateFields });

                    // Re-read the updated line from Markdown instead of using spread-with-override.
                    // This avoids preserving trailing spaces from `task` when creating `task2`.
                    // It matters for the test case where `start`, `scheduled`, and `due` are all null.
                    const urgencyDescription = ` urgency = ${task.urgency.toFixed(5)}`;
                    const task2 = fromLine({ line: line + urgencyDescription + dateFields });

                    tasks.push(task2);
                }
            }
        }
        verifySortedTasks(tasks);
    });
});
