/**
 * @jest-environment jsdom
 */

import moment from 'moment';

import { SampleTasks } from '../../../../TestHelpers';
import {
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from './VerifyFunctionFieldSamples';

window.moment = moment;

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-08 20:00'));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('custom grouping by task.happens', () => {
    const customGroups = [
        [
            'group by function task.happens?.format("YYYY-MM-DD dddd") || ""',
            'Like "group by task.happens", except it does not write "No happens date" if none of task.start, task.scheduled, and task.due are set. The question mark (`?`) and `|| ""` are needed because the happens date value may be null',
        ],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllRepresentativeDueDates());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
