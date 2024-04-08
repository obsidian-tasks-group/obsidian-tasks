import { BooleanPreprocessor } from '../../../src/Query/Filter/BooleanPreprocessor';

function split(line: string) {
    return BooleanPreprocessor.splitLine(line);
}

describe('BooleanPreprocessor', () => {
    it('single sub-expression', () => {
        expect(split('(not done)')).toMatchInlineSnapshot(`
            [
              "(not done)",
            ]
        `);
    });

    it('simple AND', () => {
        expect(split('(done) AND (has done date)')).toMatchInlineSnapshot(`
            [
              "(done",
              ") AND (",
              "has done date)",
            ]
        `);
    });

    it('simple OR', () => {
        expect(split('(done) OR (has done date)')).toMatchInlineSnapshot(`
            [
              "(done",
              ") OR (",
              "has done date)",
            ]
        `);
    });
});
