import { SampleTasks } from '../../../../TestHelpers';
import {
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from './VerifyFunctionFieldSamples';

describe('custom grouping by task.status.nextStatusSymbol', () => {
    const customGroups = [
        [
            'group by function "Next status symbol: " + task.status.nextStatusSymbol.replace(" ", "space")',
            'Group by the next status symbol, making space characters visible',
        ],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllStatuses());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
