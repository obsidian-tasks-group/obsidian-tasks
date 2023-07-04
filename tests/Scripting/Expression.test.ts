/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { parseAndEvaluateExpression, parseExpression } from '../../src/Scripting/Expression';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdownTable';
import { formatToRepresentType } from './ScriptingTestHelpers';

window.moment = moment;

describe('Expression', () => {
    const task = TaskBuilder.createFullyPopulatedTask();

    describe('detect errors at parse stage', () => {
        it('should report meaningful error message for duplicate return statement', () => {
            // parseExpression() currently adds a return statement, to save user typing it.
            expect(parseExpression([], 'return 42')).toEqual(
                'Error: Failed parsing expression "return 42". The error message was: "SyntaxError: Unexpected token \'return\'"',
            );
        });

        it('should report meaningful error message for parentheses too few parentheses', () => {
            expect(parseExpression([], 'x(')).toEqual(
                'Error: Failed parsing expression "x(". The error message was: "SyntaxError: Unexpected token \'}\'"',
            );
        });

        it('should report meaningful error message for parentheses too many parentheses', () => {
            expect(parseExpression([], 'x())')).toEqual(
                'Error: Failed parsing expression "x())". The error message was: "SyntaxError: Unexpected token \')\'"',
            );
        });
    });

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

        let markdown = '~~~text\n';
        for (const expression of expressions) {
            const result = parseAndEvaluateExpression(task, expression);
            markdown += `${expression} => ${formatToRepresentType(result)}\n`;
        }
        markdown += '~~~\n';
        verifyMarkdownForDocs(markdown);
    });
});
