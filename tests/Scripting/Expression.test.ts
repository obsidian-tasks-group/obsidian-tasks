/**
 * @jest-environment jsdom
 */
import moment from 'moment';

import { evaluateExpression } from '../../src/Scripting/Expression';
import { verifyAll } from '../TestingTools/ApprovalTestHelpers';
import { TaskBuilder } from '../TestingTools/TaskBuilder';

window.moment = moment;

describe('Expression', () => {
    it('result', () => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const expression = [
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
        verifyAll((a) => `${evaluateExpression(task, a)}`, expression);
    });
});
