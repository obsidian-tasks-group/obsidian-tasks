import { TextField } from '../Filter/TextField';

export class SubstringMatcher {
    private readonly stringToFind: string;

    constructor(stringToFind: string) {
        this.stringToFind = stringToFind;
    }

    public matches(textToFind: string): boolean {
        return TextField.stringIncludesCaseInsensitive(
            textToFind,
            this.stringToFind,
        );
    }
}
