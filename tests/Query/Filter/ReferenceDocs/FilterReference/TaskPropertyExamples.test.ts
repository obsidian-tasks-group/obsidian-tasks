import { SampleTasks } from '../../../../TestHelpers';
import {
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from './VerifyFunctionFieldSamples';

describe('custom grouping by description', () => {
    const customGroups = [
        [
            'group by function task.description',
            'group by description. This might be useful for finding completed recurrences of the same task',
        ],
        ['group by function task.description.toUpperCase()', 'Convert the description to capitals'],
        [
            'group by function task.description.slice(0, 25)',
            'Truncate descriptions to at most their first 25 characters, and group by that string',
        ],
        [
            "group by function task.description.replace('short', '==short==')",
            'Highlight the word "short" in any group descriptions',
        ],
    ];

    it('results', () => {
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, SampleTasks.withAllRepresentativeDescriptions());
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
