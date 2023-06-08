import { SampleTasks } from '../../../../TestHelpers';
import {
    verifyFunctionFieldGrouperSamplesForDocs,
    verifyFunctionFieldGrouperSamplesOnTasks,
} from './VerifyFunctionFieldSamples';

describe('custom grouping by tag', () => {
    const customGroups = [
        [
            'group by function task.tags',
            'Like "group by tags" except that tasks with no tags have no heading instead of "(No tags)"',
        ],
        [
            'group by function task.tags.join(", ")',
            'Tasks with multiple tags are listed once, with a heading that combines all the tags. Separating with commas means the tags are clickable in the headings',
        ],
        [
            'group by function task.tags.filter( (t) => t.includes("#context/"))',
            'Only create headings for tags that contain "#context/"',
        ],
        [
            'group by function task.tags.filter( (t) => ! t.includes("#tag"))',
            'Create headings for all tags that do not contain "#tag"',
        ],
    ];

    it('results', () => {
        const tasks = SampleTasks.withRepresentativeTags();
        verifyFunctionFieldGrouperSamplesOnTasks(customGroups, tasks);
    });

    it('docs', () => {
        verifyFunctionFieldGrouperSamplesForDocs(customGroups);
    });
});
