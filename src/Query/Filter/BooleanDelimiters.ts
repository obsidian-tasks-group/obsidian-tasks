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

    private constructor(openFilterChars: string) {
        this.openFilterChars = openFilterChars;
        this.openFilter = anyOfTheseChars(this.openFilterChars);
    }

    public static allSupportedDelimiters(): BooleanDelimiters {
        return new BooleanDelimiters('("');
    }
}
