import { SampleTasks } from '../../../../TestHelpers';
import {
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from './VerifyFunctionFieldSamples';

describe('custom grouping by status.type', () => {
    const customGroups = [
        [
            'group by function task.status.type',
            'Unlike "group by status.type", this sorts the status types in alphabetical order',
        ],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllStatuses());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
