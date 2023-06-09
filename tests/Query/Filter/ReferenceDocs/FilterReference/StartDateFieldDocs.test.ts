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

describe('custom grouping by task.start', () => {
    const customGroups = [
        [
            'group by function task.start?.format("YYYY-MM-DD dddd") || ""',
            'Like "group by task.start", except it does not write "No start date" if there is no start date. The question mark (`?`) and `|| ""` are needed because the start date value may be null',
        ],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllRepresentativeStartDates());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
