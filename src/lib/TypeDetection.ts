/**
 * Return a string representation of the {@link value}'s type, for showing to users, such as in error messages.
 * @param value
 */
export function getValueType(value: any): string {
    if (value === null) {
        return 'null';
    }

    return typeof value;
}
