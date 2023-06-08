import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import type { Task } from '../../../../../src/Task';
import { FunctionField } from '../../../../../src/Query/Filter/FunctionField';
import { groupHeadingsForTask } from '../../../../CustomMatchers/CustomMatchersForGrouping';
import { SampleTasks } from '../../../../TestHelpers';
import { verifyMarkdownForDocs } from '../../../../TestingTools/VerifyMarkdownTable';

function verifyFunctionFieldSamplesOnTasks(customGroups: string[][], tasks: Task[]) {
    verifyAll('Results of custom groupers', customGroups, (group) => {
        const instruction = group[0];
        const comment = group[1];
        const grouper = new FunctionField().createGrouperFromLine(instruction);
        const headings = groupHeadingsForTask(grouper!, tasks);
        return `
${instruction}
${comment}
=>
${headings.join('\n')}
====================================================================================
`;
    });
}

function verifyFunctionFieldSamplesForDocs(customGroups: string[][]) {
    let markdown = '';
    for (const group of customGroups) {
        const instruction = group[0];
        const comment = group[1];
        markdown += `
~~~text
${instruction}
~~~

- ${comment}.

`;
    }
    verifyMarkdownForDocs(markdown);
}

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
        verifyFunctionFieldSamplesOnTasks(customGroups, tasks);
    });

    it('docs', () => {
        verifyFunctionFieldSamplesForDocs(customGroups);
    });
});
