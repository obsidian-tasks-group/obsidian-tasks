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

describe('custom grouping by task.done', () => {
    const customGroups = [
        [
            'group by function task.done?.format("YYYY-MM-DD dddd") || ""',
            'Like "group by task.done", except it does not write "No done date" if there is no done date. The question mark (`?`) and `|| ""` are needed because the done date value may be null',
        ],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllRepresentativeDoneDates());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
