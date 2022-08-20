import { TextField } from '../Filter/TextField';
import type { StringMatcher } from './StringMatcher';

export class SubstringMatcher implements StringMatcher {
    private readonly stringToFind: string;

    constructor(stringToFind: string) {
        this.stringToFind = stringToFind;
    }

    matches(stringToSearch: string): boolean {
        return TextField.stringIncludesCaseInsensitive(
            stringToSearch,
            this.stringToFind,
        );
    }
}
