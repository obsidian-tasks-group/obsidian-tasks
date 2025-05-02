import type { IncludesMap } from '../Config/Settings';

export function unknownIncludeErrorMessage(includeName: string, includes: IncludesMap) {
    let message = `Cannot find include "${includeName}" in the Tasks settings`;

    const isIncludesEmpty = Object.keys(includes).length === 0;
    if (isIncludesEmpty) {
        message += `\nYou can define the instruction(s) for "${includeName}" in the Tasks settings.`;
    } else {
        const availableNames = Object.entries(includes)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n  ');
        message += `\nThe following includes are defined:\n  ${availableNames}`;
    }

    return message;
}
