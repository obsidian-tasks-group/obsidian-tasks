// Utilities for building and using date-matching regexes for configurable formats

// Convert a Moment-like format string into a loose regex fragment for matching
// Supported tokens: YYYY, YY, MMMM, MMM, MM, M, DD, D
export function momentFormatToRegex(format: string): string {
    let i = 0;
    let out = '';
    const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    while (i < format.length) {
        const substr = format.substring(i);
        if (substr.startsWith('YYYY')) {
            out += '\\d{4}';
            i += 4;
            continue;
        }
        if (substr.startsWith('YY')) {
            out += '\\d{2}';
            i += 2;
            continue;
        }
        if (substr.startsWith('MMMM')) {
            out += '[A-Za-z]+';
            i += 4;
            continue;
        }
        if (substr.startsWith('MMM')) {
            out += '[A-Za-z]{3}';
            i += 3;
            continue;
        }
        if (substr.startsWith('MM')) {
            out += '\\d{2}';
            i += 2;
            continue;
        }
        if (substr.startsWith('M')) {
            out += '\\d{1,2}';
            i += 1;
            continue;
        }
        if (substr.startsWith('DD')) {
            out += '\\d{2}';
            i += 2;
            continue;
        }
        if (substr.startsWith('D')) {
            out += '\\d{1,2}';
            i += 1;
            continue;
        }
        // Literal character
        out += escapeRegex(format[i]);
        i += 1;
    }
    return out;
}

// Build a value pattern that matches either [[DATE]] or plain DATE, with paired brackets.
// Note: This uses two capture groups; callers should extract via extractDateGroup().
export function dateValuePatternForFormat(format: string): string {
    const inner = momentFormatToRegex(format);
    return '(?:\\[\\[(' + inner + ')\\]\\]|(' + inner + '))';
}

// Given a RegExp match array from a regex built with dateValuePatternForFormat(),
// return the matched date text from the appropriate capture group.
export function extractDateGroup(match: RegExpMatchArray | null): string | null {
    if (!match) return null;
    return match[1] ?? match[2] ?? null;
}
