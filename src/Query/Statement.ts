/**
 * A single logical input statement in a Tasks Query block.
 *
 * This may represent multiple lines with continuation characters.
 *
 * {@link instruction} is the final line, after configuration lines and placeholders have been applied.
 * If continuation lines were used, {@link rawInstruction} represents the multi-line input.
 */
export class Statement {
    public readonly rawInstruction: string;
    public readonly instruction: string;

    constructor(rawInstruction: string, instruction: string) {
        this.rawInstruction = rawInstruction;
        this.instruction = instruction;
    }
}
