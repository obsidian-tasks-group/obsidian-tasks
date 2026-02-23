import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { testFilter } from '../../TestingTools/FilterTestHelpers';
import { DurationField } from '../../../src/Query/Filter/DurationField';
import { expectTaskComparesBefore, expectTaskComparesEqual } from '../../CustomMatchers/CustomMatchersForSorting';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import { TasksFile } from '../../../src/Scripting/TasksFile';

function makeTask(durationText: string | null) {
    return new TaskBuilder().duration(durationText);
}

function testDurationFilter(filter: string, durationText: string | null, expected: boolean) {
    const filterOrError = new DurationField().createFilterOrErrorMessage(filter);
    testFilter(filterOrError, makeTask(durationText), expected);
}

describe('has duration / no duration', () => {
    it('has duration - matches task with duration', () => {
        testDurationFilter('has duration', '1h30m', true);
    });

    it('has duration - does not match task without duration', () => {
        testDurationFilter('has duration', null, false);
    });

    it('no duration - matches task without duration', () => {
        testDurationFilter('no duration', null, true);
    });

    it('no duration - does not match task with duration', () => {
        testDurationFilter('no duration', '45m', false);
    });
});

describe('duration is', () => {
    it('matches exact duration in same format', () => {
        testDurationFilter('duration is 1h30m', '1h30m', true);
    });

    it('matches semantically equal duration in different format (90m == 1h30m)', () => {
        testDurationFilter('duration is 1h30m', '90m', true);
        testDurationFilter('duration is 90m', '1h30m', true);
    });

    it('does not match a different duration', () => {
        testDurationFilter('duration is 2h', '1h', false);
        testDurationFilter('duration is 30m', '45m', false);
    });

    it('does not match task with no duration', () => {
        testDurationFilter('duration is 1h', null, false);
    });
});

describe('duration above', () => {
    it('matches task with longer duration', () => {
        testDurationFilter('duration above 1h', '2h', true);
        testDurationFilter('duration above 30m', '1h', true);
    });

    it('does not match task with equal duration', () => {
        testDurationFilter('duration above 1h', '1h', false);
        testDurationFilter('duration above 1h30m', '90m', false);
    });

    it('does not match task with shorter duration', () => {
        testDurationFilter('duration above 2h', '1h', false);
    });

    it('does not match task with no duration', () => {
        testDurationFilter('duration above 1h', null, false);
    });
});

describe('duration below', () => {
    it('matches task with shorter duration', () => {
        testDurationFilter('duration below 2h', '1h', true);
        testDurationFilter('duration below 1h', '30m', true);
    });

    it('does not match task with equal duration', () => {
        testDurationFilter('duration below 1h', '1h', false);
        testDurationFilter('duration below 90m', '1h30m', false);
    });

    it('does not match task with longer duration', () => {
        testDurationFilter('duration below 1h', '2h', false);
    });

    it('does not match task with no duration', () => {
        testDurationFilter('duration below 1h', null, false);
    });
});

describe('invalid filter syntax', () => {
    it('returns error for unknown keyword', () => {
        const result = new DurationField().createFilterOrErrorMessage('duration over 1h');
        expect(result.error).toBeDefined();
    });

    it('returns error for invalid duration value', () => {
        const result = new DurationField().createFilterOrErrorMessage('duration is notaduration');
        expect(result.error).toBeDefined();
    });
});

describe('sorting', () => {
    it('sorts tasks by duration ascending', () => {
        const sorter = new DurationField().createNormalSorter();
        const short = makeTask('30m').build();
        const medium = makeTask('1h').build();
        const long = makeTask('2h').build();

        expectTaskComparesBefore(sorter, short, medium);
        expectTaskComparesBefore(sorter, medium, long);
        expectTaskComparesBefore(sorter, short, long);
        expectTaskComparesEqual(sorter, short, makeTask('30m').build());
    });

    it('sorts tasks with no duration after tasks with duration', () => {
        const sorter = new DurationField().createNormalSorter();
        const noDuration = makeTask(null).build();
        const withDuration = makeTask('1h').build();

        expectTaskComparesBefore(sorter, withDuration, noDuration);
    });

    it('treats semantically equal durations as equal', () => {
        const sorter = new DurationField().createNormalSorter();
        const task90m = makeTask('90m').build();
        const task1h30m = makeTask('1h30m').build();

        expectTaskComparesEqual(sorter, task90m, task1h30m);
    });
});

describe('grouping', () => {
    const searchInfo = new SearchInfo(new TasksFile(''), []);

    it('groups task with duration by duration text', () => {
        const task = makeTask('1h30m').build();
        const groups = new DurationField().grouper()(task, searchInfo);
        expect(groups).toEqual(['1h30m']);
    });

    it('groups task with no duration as "No duration"', () => {
        const task = makeTask(null).build();
        const groups = new DurationField().grouper()(task, searchInfo);
        expect(groups).toEqual(['No duration']);
    });
});

describe('canCreateFilterForLine', () => {
    it.each(['has duration', 'no duration', 'duration is 1h', 'duration above 30m', 'duration below 2h'])(
        'recognises "%s"',
        (line) => {
            expect(new DurationField().canCreateFilterForLine(line)).toBe(true);
        },
    );

    it('does not recognise unrelated instructions', () => {
        expect(new DurationField().canCreateFilterForLine('priority is high')).toBe(false);
        expect(new DurationField().canCreateFilterForLine('due after today')).toBe(false);
    });
});
