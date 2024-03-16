/**
 * A single logical input statement in a Tasks Query block.
 *
 * This may represent multiple lines with continuation characters.
 *
 * - {@link anyContinuationLinesRemoved} is the statement after continuation lines have been applied.
 *                                       It may contain placeholders, however.
 * - If continuation lines were used, {@link rawInstruction} represents the multi-line input.
 * - {@link anyPlaceholdersExpanded} will differ from {@link anyContinuationLinesRemoved} if there were any placeholders.
 *
 * In tests, generally all 3 fields are identical, as the continuation characters and placeholders
 * are only applied in {@link Query}.
 */
export class Statement {
    private readonly _rawInstruction: string;
    private readonly _anyContinuationLinesRemoved: string;
    private _anyPlaceholdersExpanded: string; // May be updated in recordExpandedPlaceholders() after construction

    /**
     *
     * @param rawInstruction - If the query used continuation lines for this statement, rawInstruction represents the multi-line input.
     * @param instruction - whitespace is trimmed
     */
    constructor(rawInstruction: string, instruction: string) {
        this._rawInstruction = rawInstruction;
        this._anyContinuationLinesRemoved = instruction.trim();
        this._anyPlaceholdersExpanded = this._anyContinuationLinesRemoved;
    }

    public recordExpandedPlaceholders(line: string) {
        this._anyPlaceholdersExpanded = line;
    }

    /**
     * The original text of this statement, with all original whitespace.
     *
     * If there were continuation lines in the query, this will contain newline characters.
     */
    public get rawInstruction(): string {
        return this._rawInstruction;
    }

    /**
     * The text of this statement after any continuation lines have been removed.
     *
     * Currently, the line is trimmed, although that may change.
     */
    public get anyContinuationLinesRemoved(): string {
        return this._anyContinuationLinesRemoved;
    }

    public get anyPlaceholdersExpanded(): string {
        return this._anyPlaceholdersExpanded;
    }

    public explainStatement(indent: string) {
        function appendLineIfDifferent(previousLine: string, nextLine: string) {
            if (nextLine !== previousLine) {
                result += ` =>
${indent}${nextLine}`;
            }
        }

        let result = `${indent}${this._rawInstruction}`;
        appendLineIfDifferent(this._rawInstruction, this._anyContinuationLinesRemoved);
        appendLineIfDifferent(this._anyContinuationLinesRemoved, this._anyPlaceholdersExpanded);

        return result;
    }
}
