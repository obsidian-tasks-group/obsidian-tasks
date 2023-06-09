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

describe('custom grouping by task.created', () => {
    const customGroups = [
        [
            'group by function task.created?.format("YYYY-MM-DD dddd") || ""',
            'Like "group by task.created", except it does not write "No created date" if there is no created date. The question mark (`?`) and `|| ""` are needed because the created date value may be null',
        ],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllRepresentativeCreatedDates());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
