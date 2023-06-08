import { SampleTasks } from '../../../../TestHelpers';
import {
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from './VerifyFunctionFieldSamples';

describe('custom grouping by status.name', () => {
    const customGroups = [
        ['group by function task.status.name', 'Identical to "group by status.name"'],
        ['group by function task.status.name.toUpperCase()', 'Convert the status names to capitals'],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllStatuses());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
