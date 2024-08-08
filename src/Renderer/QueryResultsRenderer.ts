import { MarkdownRenderChild } from 'obsidian';

export class QueryResultsRenderer extends MarkdownRenderChild {
    /**
     * The complete text in the instruction block, such as:
     * ```
     *   not done
     *   short mode
     * ```
     *
     * This does not contain the Global Query from the user's settings.
     * Use {@link getQueryForQueryRenderer} to get this value prefixed with the Global Query.
     */
    protected readonly source: string;

    constructor(container: HTMLElement, source: string) {
        super(container);

        this.source = source;
    }
}
