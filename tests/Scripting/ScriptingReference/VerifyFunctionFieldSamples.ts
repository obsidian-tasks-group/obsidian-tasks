import { verifyAll } from 'approvals/lib/Providers/Jest/JestApprovals';
import { FunctionField } from '../../../src/Query/Filter/FunctionField';
import type { Task } from '../../../src/Task/Task';
import { groupHeadingsForTask } from '../../CustomMatchers/CustomMatchersForGrouping';
import { verifyMarkdownForDocs } from '../../TestingTools/VerifyMarkdown';
import { expandPlaceholders } from '../../../src/Scripting/ExpandPlaceholders';
import { makeQueryContext } from '../../../src/Scripting/QueryContext';
import { scan } from '../../../src/Query/Scanner';
import { SearchInfo } from '../../../src/Query/SearchInfo';
import { Sort } from '../../../src/Query/Sort/Sort';
import { toLines } from '../../TestingTools/TestHelpers';

/** For example, 'task.due' */
type TaskPropertyName = string;

export type CustomPropertyDocsTestData = [TaskPropertyName, QueryInstructionLineAndDescription[], Task[]];

// -----------------------------------------------------------------------------------------------------------------
// Helper functions
// -----------------------------------------------------------------------------------------------------------------

function preprocessSingleInstruction(instruction: string, path: string) {
    const instructions = scan(instruction);
    expect(instructions.length).toEqual(1);
    return expandPlaceholders(instructions[0], makeQueryContext(path));
}

function punctuateComments(comments: string[]) {
    return comments.map((comment) => {
        if ('.,:`'.includes(comment.slice(-1))) {
            return comment;
        } else {
            return comment + '.';
        }
    });
}

function formatQueryAndResultsForApproving(instruction: string, comments: string[], matchingTasks: string[]) {
    const punctuatedComments: string[] = punctuateComments(comments);
    return `
${instruction}
${punctuatedComments.join('\n')}
=>
${matchingTasks.join('\n')}
====================================================================================
`;
}

function formatQueryAndCommentsForDocs(filters: QueryInstructionLineAndDescription[]) {
    let markdown = '';
    if (filters.length === 0) {
        markdown = '';
    } else {
        for (const filter of filters) {
            const instruction = filter[0];
            const comments = filter.slice(1);
            const punctuatedComments: string[] = punctuateComments(comments);

            // Using javascript as the fenced code block language makes the
            // published documentation easier to read, as the syntax highlighting
            // breaks up an otherwise long wall of text.
            // If using WebStorm IDE, it will complain about invalid JavaScript.
            // Turn off checking: https://www.jetbrains.com/help/webstorm/markdown.html#disable-injection-in-code-blocks
            const language = 'javascript';

            markdown += `
\`\`\`${language}
${instruction}
\`\`\`

${punctuatedComments.map((l) => l.replace(/^( *)/, '$1- ')).join('\n')}
`;
        }
    }
    return markdown;
}

// -----------------------------------------------------------------------------------------------------------------
// Filtering
// -----------------------------------------------------------------------------------------------------------------

export function verifyFunctionFieldFilterSamplesOnTasks(filters: QueryInstructionLineAndDescription[], tasks: Task[]) {
    if (filters.length === 0) {
        return;
    }
    verifyAll('Results of custom filters', filters, (filter) => {
        const instruction = filter[0];
        const comment = filter.slice(1);

        const path = 'a/b.md';
        const expandedInstruction = preprocessSingleInstruction(instruction, path);
        const filterOrErrorMessage = new FunctionField().createFilterOrErrorMessage(expandedInstruction);
        expect(filterOrErrorMessage).toBeValid();

        const filterFunction = filterOrErrorMessage.filterFunction!;
        const matchingTasks: string[] = [];
        const searchInfo = new SearchInfo(path, tasks);
        for (const task of tasks) {
            const matches = filterFunction(task, searchInfo);
            if (matches) {
                matchingTasks.push(task.toFileLineString());
            }
        }
        return formatQueryAndResultsForApproving(instruction, comment, matchingTasks);
    });
}

export function verifyFunctionFieldFilterSamplesForDocs(filters: QueryInstructionLineAndDescription[]) {
    const markdown = formatQueryAndCommentsForDocs(filters);
    verifyMarkdownForDocs(markdown);
}

// -----------------------------------------------------------------------------------------------------------------
// Sorting
// -----------------------------------------------------------------------------------------------------------------

export function verifyFunctionFieldSortSamplesOnTasks(
    instructions: QueryInstructionLineAndDescription[],
    tasks: Task[],
) {
    if (instructions.length === 0) {
        return;
    }
    verifyAll('Results of custom sorters', instructions, (filter) => {
        const instruction = filter[0];
        const comment = filter.slice(1);

        const path = 'a/b.md';
        const expandedInstruction = preprocessSingleInstruction(instruction, path);
        const sorter = new FunctionField().createSorterFromLine(expandedInstruction);
        expect(sorter).not.toBeNull();

        const tasksSorted = Sort.by([sorter!], tasks, new SearchInfo(path, tasks));
        return formatQueryAndResultsForApproving(instruction, comment, toLines(tasksSorted));
    });
}

// -----------------------------------------------------------------------------------------------------------------
// Grouping
// -----------------------------------------------------------------------------------------------------------------

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

        const path = 'a/b.md';
        const expandedInstruction = preprocessSingleInstruction(instruction, path);
        const grouper = new FunctionField().createGrouperFromLine(expandedInstruction);
        expect(grouper).not.toBeNull();

        const headings = groupHeadingsForTask(grouper!, tasks, new SearchInfo(path, tasks));
        return formatQueryAndResultsForApproving(instruction, comment, headings);
    });
}

export function verifyFunctionFieldGrouperSamplesForDocs(customGroups: QueryInstructionLineAndDescription[]) {
    const markdown = formatQueryAndCommentsForDocs(customGroups);
    verifyMarkdownForDocs(markdown);
}
