import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import { FunctionField } from '../../../../../src/Query/Filter/FunctionField';
import type { Task } from '../../../../../src/Task';
import { groupHeadingsForTask } from '../../../../CustomMatchers/CustomMatchersForGrouping';
import { verifyMarkdownForDocs } from '../../../../TestingTools/VerifyMarkdownTable';

/**
 * The first value is an example Tasks query block instruction line.
 *
 * The second and subsequent values are descriptive text for the user docs, explaining the instruction line.
 * The descriptions will be written in a bullet list.
 * To indent a bullet line, put spaces before it - 4 spaces is suggested.
 * A full-stop ('.') is added to the last line of the description.
 */
export type QueryInstructionLineAndDescription = string[];

export function verifyFunctionFieldGrouperSamplesOnTasks(
    customGroups: QueryInstructionLineAndDescription[],
    tasks: Task[],
) {
    verifyAll('Results of custom groupers', customGroups, (group) => {
        const instruction = group[0];
        const comment = group.slice(1);
        const grouper = new FunctionField().createGrouperFromLine(instruction);
        const headings = groupHeadingsForTask(grouper!, tasks);
        return `
${instruction}
${comment.join('\n')}
=>
${headings.join('\n')}
====================================================================================
`;
    });
}

export function verifyFunctionFieldGrouperSamplesForDocs(customGroups: QueryInstructionLineAndDescription[]) {
    let markdown = '';
    for (const group of customGroups) {
        const instruction = group[0];
        const comments = group.slice(1);
        markdown += `- \`\`\`${instruction}\`\`\`
${comments.map((l) => l.replace(/^( *)/, '$1    - ')).join('\n')}.
`;
    }
    verifyMarkdownForDocs(markdown);
}
