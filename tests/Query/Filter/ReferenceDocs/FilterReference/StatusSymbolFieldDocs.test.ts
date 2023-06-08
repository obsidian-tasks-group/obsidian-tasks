import { SampleTasks } from '../../../../TestHelpers';
import {
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from './VerifyFunctionFieldSamples';

describe('custom grouping by status.symbol', () => {
    const customGroups = [
        [
            'group by function "Status symbol: " + task.status.symbol.replace(" ", "space")',
            'Group by the status symbol, making space characters visible',
        ],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllStatuses());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
