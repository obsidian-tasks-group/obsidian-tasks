export function anyOfTheseChars(allowedChars: string): string {
    return new RegExp('[' + allowedChars + ']').source;
}

/**
 * A class to try to identify the type of delimiter used between Boolean operators.
 *
 * Currently under development
 */
export class BooleanDelimiters {
    public readonly openFilterChars;
    public readonly openFilter;

    public readonly closeFilterChars;
    public readonly closeFilter;

    public readonly openAndCloseFilterChars;

    private constructor(openFilterChars: string, closeFilterChars: string, openAndCloseFilterChars: string) {
        this.openFilterChars = openFilterChars;
        this.closeFilterChars = closeFilterChars;
        this.openAndCloseFilterChars = openAndCloseFilterChars;

        this.openFilter = anyOfTheseChars(this.openFilterChars);
        this.closeFilter = anyOfTheseChars(this.closeFilterChars);
    }

    public static allSupportedDelimiters(): BooleanDelimiters {
        return new BooleanDelimiters('("', ')"', '()"');
    }
}
