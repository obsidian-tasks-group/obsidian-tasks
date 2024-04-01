export const newLineChar = '\n';

export function appendToEndOfFile(initialContent: string, textToAppend: string) {
    if (textToAppend.length === 0) {
        return initialContent;
    }
    let result = initialContent;
    if (result.length > 0 && !result.endsWith(newLineChar)) {
        result += newLineChar;
    }
    result += textToAppend;
    if (!textToAppend.endsWith(newLineChar)) {
        result += newLineChar;
    }
    return result;
}

export function appendToListWithinFile(initialContent: string, targetListHeading: string, textToAppend: string) {
    if (textToAppend.length === 0) {
        return initialContent;
    }
    if (targetListHeading === '') {
        throw Error('Cannot move line to list as empty target list heading was supplied');
    }
    const linesArray = initialContent.split('\n');
    const headingLine = linesArray.indexOf(targetListHeading);

    if (headingLine === -1) {
        let result = initialContent;
        if (result.length > 0 && !result.endsWith(newLineChar)) {
            result += newLineChar;
        }
        result += targetListHeading + newLineChar + textToAppend + newLineChar;
        return result;
    } else {
        linesArray[headingLine] += newLineChar + textToAppend;
        return linesArray.join(newLineChar);
    }
}
