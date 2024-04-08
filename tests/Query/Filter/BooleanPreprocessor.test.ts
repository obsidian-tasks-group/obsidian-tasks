import { BooleanPreprocessor } from '../../../src/Query/Filter/BooleanPreprocessor';

function split(line: string) {
    return BooleanPreprocessor.preprocessExpressionV2(line);
}

describe('BooleanPreprocessor', () => {
    describe('single operators - surrounded by at least one space', () => {
        it('single sub-expression', () => {
            expect(split('(not done)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "not done",
                  },
                  "parts": [
                    "(",
                    "not done",
                    ")",
                  ],
                  "simplifiedLine": "(f1)",
                }
            `);
        });

        it('simple AND', () => {
            expect(split('(done) AND (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "parts": [
                    "(",
                    "done",
                    ") AND (",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "(f1) AND (f2)",
                }
            `);
        });

        it('simple AND - filters capitalised', () => {
            expect(split('(DONE) AND (HAS DONE DATE)')).toMatchInlineSnapshot(`
                {
                  "filters": {},
                  "parts": [
                    "(",
                    "DONE",
                    ") AND (",
                    "HAS DONE DATE",
                    ")",
                  ],
                  "simplifiedLine": "(DONE) AND (HAS DONE DATE)",
                }
            `);
        });

        it('simple AND NOT', () => {
            expect(split('(done) AND  NOT (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "parts": [
                    "(",
                    "done",
                    ") AND",
                    "  ",
                    "NOT (",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "(f1) AND  NOT (f2)",
                }
            `);
        });

        it('simple OR', () => {
            expect(split('(done) OR (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "parts": [
                    "(",
                    "done",
                    ") OR (",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "(f1) OR (f2)",
                }
            `);
        });

        it('simple OR NOT', () => {
            expect(split('(done) OR  NOT (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "parts": [
                    "(",
                    "done",
                    ") OR",
                    "  ",
                    "NOT (",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "(f1) OR  NOT (f2)",
                }
            `);
        });

        it('simple XOR', () => {
            expect(split('"done" XOR "has done date"')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "parts": [
                    """,
                    "done",
                    "" ",
                    "XOR",
                    " "",
                    "has done date",
                    """,
                  ],
                  "simplifiedLine": ""f1" XOR "f2"",
                }
            `);
        });

        it('simple unary NOT', () => {
            expect(split('NOT  (not done)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "not done",
                  },
                  "parts": [
                    "NOT  (",
                    "not done",
                    ")",
                  ],
                  "simplifiedLine": "NOT  (f1)",
                }
            `);
        });
    });

    describe('single operators - missing spaces around operator', () => {
        it('simple AND - but spaces missing around AND', () => {
            expect(split('(done)AND(has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "parts": [
                    "(",
                    "done",
                    ")AND(",
                    "has done date",
                    ")",
                  ],
                  "simplifiedLine": "(f1)AND(f2)",
                }
            `);
        });

        it('simple unary NOT - but spaces missing after NOT', () => {
            expect(split('NOT(not done)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "not done",
                  },
                  "parts": [
                    "NOT(",
                    "not done",
                    ")",
                  ],
                  "simplifiedLine": "NOT(f1)",
                }
            `);
        });
    });

    describe('extra delimiters', () => {
        it('redundant ( surrounding unary NOT', () => {
            expect(split('(((((NOT  ( description includes d1 ))))))')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "description includes d1",
                  },
                  "parts": [
                    "(((((",
                    "NOT  (",
                    " ",
                    "description includes d1",
                    " ))))))",
                  ],
                  "simplifiedLine": "(((((NOT  ( f1 ))))))",
                }
            `);
        });

        it('redundant " surrounding unary NOT', () => {
            expect(split('"""""NOT  " description includes d1 """"""')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "description includes d1",
                  },
                  "parts": [
                    """"""",
                    "NOT",
                    "  "",
                    " ",
                    "description includes d1",
                    " """"""",
                  ],
                  "simplifiedLine": """"""NOT  " f1 """"""",
                }
            `);
        });
    });
});
