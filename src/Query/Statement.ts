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

        // The raw instruction is stored with any surrounding whitespace from the query line.
        // However, this looks messy in explanations, and leads to complications when comparing
        // whether the different fields in this class are identical.
        // So for simplicity, we trim the raw instruction in 'explain' output.
        const rawInstructionTrimmed = this._rawInstruction.trim();

        const raw = rawInstructionTrimmed.split('\n').join('\n' + indent);
        let result = `${indent}${raw}`;

        // If the raw instruction has more than one line, append text so that the
        // subsequent '=>' string will appear at the start of the next line, for clarity:
        if (this._rawInstruction.includes('\n')) {
            result += '\n' + indent;
        }

        appendLineIfDifferent(rawInstructionTrimmed, this._anyContinuationLinesRemoved);
        appendLineIfDifferent(this._anyContinuationLinesRemoved, this._anyPlaceholdersExpanded);

        return result;
    }

    public allLinesIdentical() {
        return (
            this._rawInstruction === this._anyContinuationLinesRemoved &&
            this._rawInstruction === this._anyPlaceholdersExpanded
        );
    }
}
