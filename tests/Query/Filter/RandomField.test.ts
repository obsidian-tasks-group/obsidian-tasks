import { RandomField } from '../../../src/Query/Filter/RandomField';

const field = new RandomField();

describe('filtering by random', () => {
    it('should be named random', () => {
        expect(field.fieldName()).toEqual('random');
    });
});

describe('sorting by random', () => {
    it('should not support sorting', () => {
        expect(field.supportsSorting()).toEqual(false);
    });
});

describe('grouping by random', () => {
    it('should not support grouping', () => {
        expect(field.supportsGrouping()).toEqual(false);
    });
});
