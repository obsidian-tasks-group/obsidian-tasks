export function anyOfTheseChars(allowedChars: string): string {
    return new RegExp('[' + allowedChars + ']').source;
}

export class BooleanDelimiters {
    public readonly openFilterChars;
    public readonly openFilter;

    public readonly closeFilterChars;
    public readonly closeFilter;

    public readonly openAndCloseFilterChars;

    constructor() {
        this.openFilterChars = '("';
        this.closeFilterChars = ')"';
        this.openAndCloseFilterChars = '()"';

        this.openFilter = anyOfTheseChars(this.openFilterChars);
        this.closeFilter = anyOfTheseChars(this.closeFilterChars);
    }

    public static allSupportedDelimiters(): BooleanDelimiters {
        return new BooleanDelimiters();
    }
}
