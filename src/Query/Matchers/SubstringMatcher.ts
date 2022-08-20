import { TextField } from '../Filter/TextField';
import type { IStringMatcher } from './IStringMatcher';

/**
 * Substring-based implementation of IStringMatcher.
 *
 * This does a case-insensitive search for the given string.
 */
export class SubstringMatcher implements IStringMatcher {
    private readonly stringToFind: string;

    /**
     * Construct a SubstringMatcher object
     *
     * @param {string} stringToFind - The string to search for.
     *                                Searches will be case-insensitive.
     */
    public constructor(stringToFind: string) {
        this.stringToFind = stringToFind;
    }

    public matches(stringToSearch: string): boolean {
        return TextField.stringIncludesCaseInsensitive(
            stringToSearch,
            this.stringToFind,
        );
    }
}
