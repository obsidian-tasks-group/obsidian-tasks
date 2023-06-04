/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { groupByFn } from '../../../../../src/Query/Filter/FunctionField';

import { TaskBuilder } from '../../../../TestingTools/TaskBuilder';

window.moment = moment;

describe('task.status', () => {
    it('document-fields', () => {
        const task = TaskBuilder.createFullyPopulatedTask();
        const x = groupByFn(task, 'task.status.name');
        expect(x).toStrictEqual(['Todo']);
    });
});
