/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import {
    constructArguments,
    evaluateExpression,
    evaluateExpressionOrCatch,
    parseAndEvaluateExpression,
    parseExpression,
} from '../../src/Scripting/Expression';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdownTable';
import { formatToRepresentType } from './ScriptingTestHelpers';

window.moment = moment;

describe('Expression', () => {
    describe('support simple calculations', () => {
        it('should calculate simple expression', () => {
            expect('1 + 1').toEvaluateAs(2);
        });

        it('should support return statements', () => {
            expect('return 42').toEvaluateAs(42);
        });

        it('should allow use of a variable in expression', () => {
            expect('const x = 1 + 1; return x;').toEvaluateAs(2);
        });

        it('should support if blocks', () => {
            expect('if (1 === 1) { return "yes"; } else { return "no"; }').toEvaluateAs('yes');
            expect('if (1 !== 1) { return "yes"; } else { return "no"; }').toEvaluateAs('no');
        });

        it('should support functions - multi-line', () => {
            // Tasks only supports single-line expressions.
            // This multi-line one is used for readability
            const line = `
                function f(value) {
                    if (value === 1 ) {
                        return "yes";
                    } else {
                        return "no";
                    }
                }
                return f(1)`;
            expect(line).toEvaluateAs('yes');
        });

        it('should support functions - single-line', () => {
            const line = 'function f(value) { if (value === 1 ) { return "yes"; } else { return "no"; } } return f(1)';
            expect(line).toEvaluateAs('yes');
        });
    });

    const task = TaskBuilder.createFullyPopulatedTask();

    describe('detect errors at parse stage', () => {
        it('should report meaningful error message for parentheses too few parentheses', () => {
            expect(parseExpression([], 'x(').error).toEqual(
                'Error: Failed parsing expression "x(".\nThe error message was:\n    "SyntaxError: Unexpected token \'}\'"',
            );
        });

        it('should report meaningful error message for parentheses too many parentheses', () => {
            expect(parseExpression([], 'x())').error).toEqual(
                'Error: Failed parsing expression "x())".\nThe error message was:\n    "SyntaxError: Unexpected token \')\'"',
            );
        });
    });

    describe('detect errors at evaluation time', () => {
        const line = 'nonExistentVariable';
        const paramsArgs = constructArguments(task);
        const expression = parseExpression(paramsArgs, line);
        it('evaluateExpressionAndCatch() should report meaningful error message for invalid variable', () => {
            expect(expression.error).toBeUndefined();

            const result = evaluateExpressionOrCatch(expression.queryComponent!, paramsArgs, line);
            expect(result).toEqual(
                'Error: Failed calculating expression "nonExistentVariable".\nThe error message was:\n    "ReferenceError: nonExistentVariable is not defined"',
            );
        });

        it('evaluateExpression() should throw exception for invalid variable', () => {
            const t = () => {
                evaluateExpression(expression.queryComponent!, paramsArgs);
            };
            expect(t).toThrow(ReferenceError);
            expect(t).toThrowError('nonExistentVariable is not defined');
        });

        it('should report unknown for invalid task property', () => {
            expect(parseAndEvaluateExpression(task, 'task.iAmNotAKnownTaskProperty')).toEqual(undefined);
        });
    });

    function verifyExpressionsForDocs(expressions: string[]) {
        let markdown = '~~~text\n';
        for (const expression of expressions) {
            const result = parseAndEvaluateExpression(task, expression);
            markdown += `${expression} => ${formatToRepresentType(result)}\n`;
        }
        markdown += '~~~\n';
        verifyMarkdownForDocs(markdown);
    }

    it('result', () => {
        const expressions = [
            "'hello'",
            '"hello"',
            '""',
            '[]',
            '"" || "No value"',
            'false',
            'true',
            '1',
            '0',
            '0 || "No value"',
            '1.0765456',
            '6 * 7',
            '["heading1", "heading2"]',
            '[1, 2]',
            'null',
            'null || "No value"',
            'undefined',
            'undefined || "No value"',
            // Should allow manual escaping of markdown
            String.raw`"I _am_ not _italic_".replaceAll("_", "\\_")`,
        ];
        verifyExpressionsForDocs(expressions);
    });

    it('returns and functions', () => {
        const expressions = [
            'return 42',
            'const x = 1 + 1; return x * x',
            'if (1 === 1) { return "yes"; } else { return "no" }',
            'function f(value) { if (value === 1 ) { return "yes"; } else { return "no"; } } return f(1)',
        ];
        verifyExpressionsForDocs(expressions);
    });
});
