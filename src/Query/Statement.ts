/**
 * A single logical input statement in a Tasks Query block.
 *
 * This may represent multiple lines with continuation characters.
 *
 * - {@link anyContinuationLinesRemoved} is the statement after continuation lines have been applied.
 *                                       It may contain placeholders, however.
 * - If continuation lines were used, {@link rawInstruction} represents the multi-line input.
 */
export class Statement {
    private readonly _rawInstruction: string;
    private readonly _anyContinuationLinesRemoved: string;

    /**
     *
     * @param rawInstruction - If the query used continuation lines for this statement, rawInstruction represents the multi-line input.
     * @param instruction - whitespace is trimmed
     */
    constructor(rawInstruction: string, instruction: string) {
        this._rawInstruction = rawInstruction;
        this._anyContinuationLinesRemoved = instruction.trim();
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
}
