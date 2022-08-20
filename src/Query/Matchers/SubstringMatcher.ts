import { TextField } from '../Filter/TextField';
import type { IStringMatcher } from './IStringMatcher';

export class SubstringMatcher implements IStringMatcher {
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
