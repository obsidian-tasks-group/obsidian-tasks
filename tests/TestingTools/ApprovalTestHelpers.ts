import { Options } from 'approvals/lib/Core/Options';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import type { GlobalFilter } from '../../src/Config/GlobalFilter';
import type { GlobalQuery } from '../../src/Config/GlobalQuery';
import { Query } from '../../src/Query/Query';
import { explainResults } from '../../src/lib/QueryRendererHelper';
import type { Task } from '../../src/Task/Task';
import { verifyMarkdown } from './VerifyMarkdown';

export function printIteration<T1>(func: <T1>(t1: T1) => any, params1: T1[]): string {
    const EMPTY_ENTRY = {};
    let text = '';
    for (const p1 of params1) {
        let output;
        try {
            output = func(p1);
        } catch (e) {
            output = `${e}`;
        }
        const parameters = [p1].filter((p) => p !== EMPTY_ENTRY);

        text += `${parameters} => ${output}\n`;
    }
    return text;
}

export function verifyAll<T1>(func: (i: T1) => any, params1: T1[]) {
    // @ts-ignore
    verify(printIteration((t1) => func(t1), params1));
}

/**
 Save text to disk, so that it can be embedded in
 to documentation, using a 'snippet' line.
 * @param text
 * @param extensionWithoutDot, such as 'text' or 'explanation.text'. Needed to override the Approvals default of 'txt'.
 * @param options
 */
export function verifyWithFileExtension(text: string, extensionWithoutDot: string, options?: Options): void {
    options = options || new Options();
    options = options.forFile().withFileExtention(extensionWithoutDot);
    verify(text, options);
}

/**
 * Save an instructions block to disk, so that it can be embedded in
 * to documentation, using a 'snippet' line.
 * @todo Figure out how to include the '```tasks' and '```' lines:
 *       see discussion in https://github.com/SimonCropp/MarkdownSnippets/issues/537
 * @param instructions
 * @param options
 */
export function verifyQuery(instructions: string, options?: Options): void {
    verifyWithFileExtension(instructions, 'query.text', options);
}

/**
 * Save an explanation of the instructions block to disk, so that it can be
 * embedded in to documentation, using a 'snippet' line.
 *
 * This method explains only the instructions in a single query block.
 *
 * See {@link verifyTaskBlockExplanation} to also explain any global filter or global query.
 *
 * @param instructions
 * @param options
 */
export function verifyQueryExplanation(instructions: string, options?: Options): void {
    const query = new Query(instructions);
    const explanation = query.explainQuery();

    expect(query.error).toBeUndefined();

    verifyWithFileExtension(explanation, 'explanation.text', options);
}

/**
 * Save an explanation of the task block to disk, so that it can be
 * embedded in to documentation, using a 'snippet' line.
 *
 * This method explains the query and also any global filter or global query.
 *
 * See {@link verifyQueryExplanation} to just explain the query.
 *
 * @param instructions
 * @param globalFilter
 * @param globalQuery
 * @param options?
 */
export function verifyTaskBlockExplanation(
    instructions: string,
    globalFilter: GlobalFilter,
    globalQuery: GlobalQuery,
    options?: Options,
): void {
    const explanation = explainResults(instructions, globalFilter, globalQuery, 'some/sample/file path.md');

    verifyWithFileExtension(explanation, 'explanation.text', options);
}

/**
 * Write tasks to a markdown file, to enable their contents to be visualised.
 *
 * They are written in the order they are given.
 * @param tasks
 * @see verifyTaskListInReverseOrder
 */
export function verifyTaskList(tasks: Task[]) {
    verifyMarkdown(tasks.map((task) => task.toFileLineString()).join('\n'));
}

/**
 * Write tasks to a markdown file, to enable their contents to be visualised.
 *
 * They are written in reverse order, which may be useful for easier understand of toggled tasks.
 *
 * @param tasks
 * @see verifyTaskList
 */
export function verifyTaskListInReverseOrder(tasks: Task[]) {
    const reverse = [...tasks].reverse();
    verifyTaskList(reverse);
}
