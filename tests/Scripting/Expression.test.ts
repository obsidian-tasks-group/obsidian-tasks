/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { evaluateExpression } from '../../src/Scripting/Expression';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { verifyMarkdownForDocs } from '../TestingTools/VerifyMarkdownTable';
import { formatToRepresentType } from './ScriptingTestHelpers';

window.moment = moment;

describe('Expression', () => {
    it('result', () => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const expressions = [
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
            '["heading1", "heading2"]', // return two headings, indicating that this task should be displayed twice, once in each heading
            '[1, 2]', // return two headings, that need to be converted to strings
            'null',
            'null || "No value"',
            'undefined',
            'undefined || "No value"',
            // Should allow manual escaping of markdown
            String.raw`"I _am_ not _italic_".replaceAll("_", "\\_")`,
        ];

        let markdown = '~~~text\n';
        for (const expression of expressions) {
            const result = evaluateExpression(task, expression);
            markdown += `${expression} => ${formatToRepresentType(result)}\n`;
        }
        markdown += '~~~\n';
        verifyMarkdownForDocs(markdown);
    });
});
