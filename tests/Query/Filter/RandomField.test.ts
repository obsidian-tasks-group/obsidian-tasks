/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { RandomField } from '../../../src/Query/Filter/RandomField';
import { fromLine } from '../../TestingTools/TestHelpers';
import { expectTaskComparesEqual } from '../../CustomMatchers/CustomMatchersForSorting';

window.moment = moment;

const field = new RandomField();

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
        // Arrange
        const sorter = field.createNormalSorter();
        const task1 = fromLine({ line: '- [ ] Some description' });

        // Assert
        expectTaskComparesEqual(sorter, task1, task1);
    });
});

describe('grouping by random', () => {
    it('should not support grouping', () => {
        expect(field.supportsGrouping()).toEqual(false);
    });
});
