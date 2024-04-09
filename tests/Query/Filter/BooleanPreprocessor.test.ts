import { BooleanPreprocessor } from '../../../src/Query/Filter/BooleanPreprocessor';
import { BooleanDelimiters } from '../../../src/Query/Filter/BooleanDelimiters';

function preprocess(line: string) {
    return BooleanPreprocessor.preprocessExpression(line, BooleanDelimiters.fromInstructionLine(line));
}

describe('BooleanPreprocessor', () => {
    describe('single operators - surrounded by at least one space', () => {
        it('single sub-expression', () => {
            expect(preprocess('(not done)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "not done",
                  },
                  "simplifiedLine": "(f1)",
                }
            `);
        });

        it('simple AND', () => {
            expect(preprocess('(done) AND (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "simplifiedLine": "(f1) AND (f2)",
                }
            `);
        });

        it('simple AND - filters capitalised', () => {
            expect(preprocess('(DONE) AND (HAS DONE DATE)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "DONE",
                    "f2": "HAS DONE DATE",
                  },
                  "simplifiedLine": "(f1) AND (f2)",
                }
            `);
        });

        it('simple AND NOT', () => {
            expect(preprocess('(done) AND  NOT (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "simplifiedLine": "(f1) AND  NOT (f2)",
                }
            `);
        });

        it('simple OR', () => {
            expect(preprocess('(done) OR (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "simplifiedLine": "(f1) OR (f2)",
                }
            `);
        });

        it('simple OR NOT', () => {
            expect(preprocess('(done) OR  NOT (has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "simplifiedLine": "(f1) OR  NOT (f2)",
                }
            `);
        });

        it('simple XOR', () => {
            expect(preprocess('"done" XOR "has done date"')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "simplifiedLine": ""f1" XOR "f2"",
                }
            `);
        });

        it('simple unary NOT', () => {
            expect(preprocess('NOT  (not done)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "not done",
                  },
                  "simplifiedLine": "NOT  (f1)",
                }
            `);
        });
    });

    describe('single operators - missing spaces around operator', () => {
        it('simple AND - but spaces missing around AND', () => {
            expect(preprocess('(done)AND(has done date)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "done",
                    "f2": "has done date",
                  },
                  "simplifiedLine": "(f1)AND(f2)",
                }
            `);
        });

        it('simple unary NOT - but spaces missing after NOT', () => {
            expect(preprocess('NOT(not done)')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "not done",
                  },
                  "simplifiedLine": "NOT(f1)",
                }
            `);
        });
    });

    describe('filters ending with delimiters', () => {
        it('swallows last character if filter ends with closing delimiter character )', () => {
            const result = preprocess('"description includes (maybe)"');
            expect(result.simplifiedLine).toEqual('"f1"');
            expect(result.filters['f1']).toEqual('description includes (maybe)');
        });

        it('swallows last character if filter ends with closing delimiter character "', () => {
            const result = preprocess('(description includes "maybe")');
            expect(result.simplifiedLine).toEqual('(f1)');
            expect(result.filters['f1']).toEqual('description includes "maybe"');
        });
    });

    describe('extra delimiters', () => {
        it('redundant ( surrounding unary NOT', () => {
            expect(preprocess('(((((NOT  ( description includes d1 ))))))')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "description includes d1",
                  },
                  "simplifiedLine": "(((((NOT  ( f1 ))))))",
                }
            `);
        });

        it('redundant " surrounding unary NOT', () => {
            expect(preprocess('"""""NOT  " description includes d1 """"""')).toMatchInlineSnapshot(`
                {
                  "filters": {
                    "f1": "description includes d1",
                  },
                  "simplifiedLine": """"""NOT  " f1 """"""",
                }
            `);
        });
    });
});
