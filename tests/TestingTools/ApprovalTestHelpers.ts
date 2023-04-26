import { Options } from 'approvals/lib/Core/Options';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import { Query } from '../../src/Query/Query';
import { explainResults } from '../../src/lib/QueryRendererHelper';

/**
 * Save an instructions block to disc, so that it can be embedded in
 * to documentation, using a 'snippet' line.
 * @todo Figure out how to include the '```tasks' and '```' lines:
 *       see discussion in https://github.com/SimonCropp/MarkdownSnippets/issues/537
 * @param instructions
 * @param options
 */
export function verifyQuery(instructions: string, options?: Options): void {
    options = options || new Options();
    options = options.forFile().withFileExtention('query.text');
    verify(instructions, options);
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
    const query = new Query({ source: instructions });
    const explanation = query.explainQuery();

    expect(query.error).toBeUndefined();

    options = options || new Options();
    options = options.forFile().withFileExtention('explanation.text');
    verify(explanation, options);
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
 * @param options
 */
export function verifyTaskBlockExplanation(instructions: string, options?: Options): void {
    const explanation = explainResults(instructions);

    options = options || new Options();
    options = options.forFile().withFileExtention('explanation.text');
    verify(explanation, options);
}
