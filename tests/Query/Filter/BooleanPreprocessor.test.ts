import { BooleanPreprocessor } from '../../../src/Query/Filter/BooleanPreprocessor';

function split(line: string) {
    return BooleanPreprocessor.preprocessExpressionV2(line);
}

describe('BooleanPreprocessor', () => {
    describe('single operators - surrounded by at least one space', () => {
        it('single sub-expression', () => {
            expect(split('(not done)')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "(",
                    "not done",
                    ")",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });

        it('simple AND', () => {
            expect(split('(done) AND (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "(",
                    "done",
                    ") AND (",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });

        it('simple AND NOT', () => {
            expect(split('(done) AND  NOT (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "(",
                    "done",
                    ") AND",
                    "  ",
                    "NOT (",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });

        it('simple OR', () => {
            expect(split('(done) OR (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "(",
                    "done",
                    ") OR (",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });

        it('simple OR NOT', () => {
            expect(split('(done) OR  NOT (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "(",
                    "done",
                    ") OR",
                    "  ",
                    "NOT (",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });

        it('simple XOR', () => {
            expect(split('"done" XOR "has done date"')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    """,
                    "done",
                    "" ",
                    "XOR",
                    " "",
                    "has done date",
                    """,
                  ],
                  "simplifiedLine": "",
                }
            `);
        });

        it('simple unary NOT', () => {
            expect(split('NOT  (not done)')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "NOT  (",
                    "not done",
                    ")",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });
    });

    describe('single operators - missing spaces around operator', () => {
        it('simple AND - but spaces missing around AND', () => {
            expect(split('(done)AND(has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "(",
                    "done",
                    ")AND(",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });

        it('simple unary NOT - but spaces missing after NOT', () => {
            expect(split('NOT(not done)')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "NOT(",
                    "not done",
                    ")",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });
    });

    describe('extra delimiters', () => {
        it('redundant ( surrounding unary NOT', () => {
            expect(split('(((((NOT  ( description includes d1 ))))))')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "(((((",
                    "NOT  (",
                    " ",
                    "description includes d1",
                    " ))))))",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });

        it('redundant " surrounding unary NOT', () => {
            expect(split('"""""NOT  " description includes d1 """"""')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    """"""",
                    "NOT",
                    "  "",
                    " ",
                    "description includes d1",
                    " """"""",
                  ],
                  "simplifiedLine": "",
                }
            `);
        });
    });
});
