/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { RandomField } from '../../../src/Query/Filter/RandomField';
import { fromLine } from '../../TestingTools/TestHelpers';
import { expectTaskComparesEqual } from '../../CustomMatchers/CustomMatchersForSorting';
import { TaskBuilder } from '../../TestingTools/TaskBuilder';

window.moment = moment;

const field = new RandomField();

beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-23'));
});

afterAll(() => {
    jest.useRealTimers();
});

describe('filtering by random', () => {
    it('should be named random', () => {
        expect(field.fieldName()).toEqual('random');
    });
});

describe('sorting by random', () => {
    it('should support sorting', () => {
        expect(field.supportsSorting()).toEqual(true);
    });

    it('should sort identical tasks the same', () => {
        const sorter = field.createNormalSorter();
        const task1 = fromLine({ line: '- [ ] Some description' });

        expectTaskComparesEqual(sorter, task1, task1);
    });

    it('sort key should ignore task properties except description', () => {
        const fullyPopulatedTask = TaskBuilder.createFullyPopulatedTask();
        const taskWithSameDescription = new TaskBuilder().description(fullyPopulatedTask.description).build();
        expect(field.sortKey(fullyPopulatedTask)).toEqual(field.sortKey(taskWithSameDescription));
    });

    it('sort key should not change, at different times', () => {
        const task1 = fromLine({ line: '- [ ] My sort key should be same, regardless of time' });

        jest.setSystemTime(new Date('2024-10-19 10:42'));
        const sortKeyAtTime1 = field.sortKey(task1);

        jest.setSystemTime(new Date('2024-10-19 21:05'));
        const sortKeyAtTime2 = field.sortKey(task1);

        expect(sortKeyAtTime1).toEqual(sortKeyAtTime2);
    });

    it('sort key should change on different dates', () => {
        const task1 = fromLine({ line: '- [ ] My sort key should differ on different dates' });

        jest.setSystemTime(new Date('2024-01-23'));
        const sortKeyOnDay1 = field.sortKey(task1);

        jest.setSystemTime(new Date('2024-01-24'));
        const sortKeyOnDay2 = field.sortKey(task1);

        expect(sortKeyOnDay1).not.toEqual(sortKeyOnDay2);
    });
});

describe('grouping by random', () => {
    it('should not support grouping', () => {
        expect(field.supportsGrouping()).toEqual(false);
    });
});
