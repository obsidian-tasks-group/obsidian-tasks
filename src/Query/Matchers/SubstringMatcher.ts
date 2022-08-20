import { TextField } from '../Filter/TextField';

export class SubstringMatcher {
    private readonly stringToFind: string;

    constructor(stringToFind: string) {
        this.stringToFind = stringToFind;
    }

    public matches(stringToSearch: string): boolean {
        return TextField.stringIncludesCaseInsensitive(
            stringToSearch,
            this.stringToFind,
        );
    }
}
