import { BooleanPreprocessor } from '../../../src/Query/Filter/BooleanPreprocessor';

function split(line: string) {
    return BooleanPreprocessor.splitLine(line);
}

describe('BooleanPreprocessor', () => {
    describe('single operators - surrounded by at least one space', () => {
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

        it('simple AND NOT', () => {
            expect(split('(done) AND  NOT (has done date)')).toMatchInlineSnapshot(`
            [
              "(done",
              ") AND  ",
              "NOT (",
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

        it('simple OR NOT', () => {
            expect(split('(done) OR  NOT (has done date)')).toMatchInlineSnapshot(`
            [
              "(done",
              ") OR  ",
              "NOT (",
              "has done date)",
            ]
        `);
        });

        it('simple XOR', () => {
            expect(split('"done" XOR "has done date"')).toMatchInlineSnapshot(`
            [
              ""done",
              "" XOR "",
              "has done date"",
            ]
        `);
        });

        it('simple unary NOT', () => {
            expect(split('NOT (not done)')).toMatchInlineSnapshot(`
            [
              "NOT (",
              "not done)",
            ]
        `);
        });
    });

    describe('single operators - missing spaces around operator', () => {
        it('simple AND - but spaces missing around AND', () => {
            expect(split('(done)AND(has done date)')).toMatchInlineSnapshot(`
            [
              "(done",
              ")AND(",
              "has done date)",
            ]
        `);
        });
    });
});
