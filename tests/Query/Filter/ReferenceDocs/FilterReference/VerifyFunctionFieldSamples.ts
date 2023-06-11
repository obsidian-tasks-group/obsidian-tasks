import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import { FunctionField } from '../../../../../src/Query/Filter/FunctionField';
import type { Task } from '../../../../../src/Task';
import { groupHeadingsForTask } from '../../../../CustomMatchers/CustomMatchersForGrouping';
import { verifyMarkdownForDocs } from '../../../../TestingTools/VerifyMarkdownTable';

export function verifyFunctionFieldGrouperSamplesOnTasks(customGroups: string[][], tasks: Task[]) {
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

export function verifyFunctionFieldGrouperSamplesForDocs(customGroups: string[][]) {
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
