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

describe('custom grouping by task.scheduled', () => {
    const customGroups = [
        [
            'group by function task.scheduled?.format("YYYY-MM-DD dddd") || ""',
            'Like "group by task.scheduled", except it does not write "No scheduled date" if there is no scheduled date. The question mark (`?`) and `|| ""` are needed because the scheduled date value may be null',
        ],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllRepresentativeDueDates());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
