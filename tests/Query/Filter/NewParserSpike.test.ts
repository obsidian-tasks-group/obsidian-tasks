import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import { P_UTILS } from '@lemons_dev/parsinom/lib/ParserUtils';

describe('new parser', () => {
    const expressionParser = P_UTILS.letters();

    it('should create a new variable', () => {
        expect(expressionParser.tryParse('expression').success).toEqual(true);
        expect(expressionParser.tryParse('expression').value).toEqual('expression');
        const tryParse = expressionParser.tryParse('123');
        expect(tryParse.success).toEqual(false);
    });

    const parensAndWhiteSpace = expressionParser.trim(P_UTILS.optionalWhitespace()).wrap(P.string('('), P.string(')'));

    it('should parse an expression surrounded by parenthesis and optionally whitespace', () => {
        // Both parens and spaces removed
        expect(parensAndWhiteSpace.tryParse('(expression)').value).toEqual('expression');
        expect(parensAndWhiteSpace.tryParse('(   expression   )').value).toEqual('expression');
    });

    function andCombine(left: any, operator: string, right: string) {
        return { left: left, right: right, operator: operator };
    }
    const andParser = P_UTILS.binaryLeft(P.string('AND'), parensAndWhiteSpace, andCombine);

    it('should recognise single expressions with no AND', () => {
        const one = andParser.tryParse('(expression)');
        expect(one.success).toEqual(true);
        expect(one.value).toMatchInlineSnapshot('"expression"');
    });

    it('should recognise two expressions with AND', () => {
        const two = andParser.tryParse('(expression) AND (expression)');
        expect(two.success).toEqual(true);
        expect(two.value).toMatchInlineSnapshot(`
            {
              "left": "expression",
              "operator": "AND",
              "right": "expression",
            }
        `);
    });

    it('should recognise three expressions with AND', () => {
        const three = andParser.tryParse('(a) AND (b) AND (c)');
        expect(three.success).toEqual(true);
        expect(three.value).toMatchInlineSnapshot(`
            {
              "left": {
                "left": "a",
                "operator": "AND",
                "right": "b",
              },
              "operator": "AND",
              "right": "c",
            }
        `);
    });

    it('should recognise four expressions with AND', () => {
        const four = andParser.tryParse('(a) AND (b) AND (c) AND (d)');
        expect(four.success).toEqual(true);
        expect(four.value).toMatchInlineSnapshot(`
            {
              "left": {
                "left": {
                  "left": "a",
                  "operator": "AND",
                  "right": "b",
                },
                "operator": "AND",
                "right": "c",
              },
              "operator": "AND",
              "right": "d",
            }
        `);

        // Think about writing a recursive function
        //  Left is an object so pass it in to AND function
        // Think of it as a tree structure
        //  A string is a leaf
        //  An object is a node
        //  Left and right are the two branches
        //  Operator (AND) determines what to do at that node - AND, OR etc....
        // Tests are usually just parser and not evaluator
        // Look at https://github.com/mProjectsCode/parsiNOM/blob/main/tests/languages/Interperter.test.ts
        // https://github.com/mProjectsCode/parsiNOM/blob/main/tests/languages/MathSimple.test.ts
        // https://github.com/mProjectsCode/parsiNOM/blob/main/tests/languages/MathLanguage.test.ts
        // https://github.com/mProjectsCode/parsiNOM/blob/main/profiling/Json.ts

        // Benefits - can test individual components...
        // Can re-use bits, like can re-use an array parser or a number parser....

        // TIPS
        // Use .describe() to give better output in its built-in error messages
        // Look at box as well
        // Use node to hang on to more information for longer... gives parsing ranges - give useful information
        //
        // Can use a custom parser:
        // - define a custom parsing function, which gets the input string and cursor position
        // - and updates the cursor position at the end
        // This could be a way to adopt the library incrementally,
        // for example to use it for Boolean parsing first, whilst sticking with the current regex implementation
        // for other instructions.
    });
});
