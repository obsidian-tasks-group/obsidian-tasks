export class RegexMatcher {
    private readonly regex: RegExp;

    constructor(regex: RegExp) {
        this.regex = regex;
    }

    public matches(stringToSearch: string): boolean {
        return stringToSearch.match(this.regex) !== null;
    }
}
