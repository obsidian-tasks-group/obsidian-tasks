/**
 * A single logical input line in a Tasks Query block.
 *
 * If continuation lines were used, this may represent multiple lines in the query file.
 */
export class Instruction {
    public readonly instruction: string;

    constructor(instruction: string) {
        this.instruction = instruction;
    }
}
