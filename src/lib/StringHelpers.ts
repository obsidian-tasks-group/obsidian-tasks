export function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Escape non-visible Variation Selectors characters in string.
 * Converts them into their Unicode escape sequences for explicit visibility.
 */
export function escapeInvisibleCharacters(input: string): string {
    return input.replace(
        /[\uFE00-\uFE0F]/g, // Matches Variation Selectors
        (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`,
    );
}
