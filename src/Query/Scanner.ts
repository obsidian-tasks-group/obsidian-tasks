/**
 * Removes newlines escaped by a backslash.
 * A trailing backslash at the end of a line can be escaped by doubling it.
 *
 * @param input input string
 * @returns modified input
 */
export function continue_lines(input: string): string {
    return input.replace(/\\\n/g, '');
}
/**
 * Take an input string and split it into a list of statements.
 *
 * Generally this is similar to splitting the string into lines, but handles line
 * continuations and escape sequences.
 *
 * @param input Input string
 * @returns List of statements
 */
export function scan(input: string): string[] {
    return continue_lines(input)
        .split('\n')
        .map((rawLine: string) => rawLine.trim())
        .filter((line) => line !== '');
}
