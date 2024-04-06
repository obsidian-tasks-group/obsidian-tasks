export function anyOfTheseChars(allowedChars: string): string {
    return new RegExp('[' + allowedChars + ']').source;
}

export class BooleanDelimiters {
    public readonly openFilterChars = '("';
    public readonly openFilter = anyOfTheseChars(this.openFilterChars);

    public readonly closeFilterChars = ')"';
    public readonly closeFilter = anyOfTheseChars(this.closeFilterChars);

    public readonly openAndCloseFilterChars = '()"';
}
