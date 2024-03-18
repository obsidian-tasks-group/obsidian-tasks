const newLineChar = '\n';
function appendToEndOfFile(initialContent: string, textToAppend: string) {
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

describe('FileWriter', () => {
    it('should be able to append to an empty file', () => {
        const initialContent = '';
        const textToAppend = '- [ ] a sample task';
        const newFile = appendToEndOfFile(initialContent, textToAppend);
        expect(newFile).toEqual(textToAppend + '\n');
    });

    it('should be able to append to a non-empty file', () => {
        const initialContent = '- [ ] an existing task\n';
        const textToAppend = '- [ ] a new sample task';
        const newFile = appendToEndOfFile(initialContent, textToAppend);
        const expectedOutput = `- [ ] an existing task
- [ ] a new sample task
`;
        expect(newFile).toEqual(expectedOutput);
    });

    it('should append a newline to initial content if needed', () => {
        const initialContent = '- [ ] an existing task';
        const textToAppend = '- [ ] a new sample task';
        const newFile = appendToEndOfFile(initialContent, textToAppend);
        const expectedOutput = `- [ ] an existing task
- [ ] a new sample task
`;
        expect(newFile).toEqual(expectedOutput);
    });

    it('should not modify file if appending an empty string', () => {
        const initialContent = '- [ ] an existing task';
        const textToAppend = '';
        const newFile = appendToEndOfFile(initialContent, textToAppend);
        expect(newFile).toEqual(initialContent);
    });

    // the above code and tests were written while pairing with Clare 2024-03-11
    // I wrote following afterward
    it('should not append a newline to new text if not needed', () => {
        const initialContent = '- [ ] an existing task';
        const textToAppend = `- [ ] a new sample task
`;
        const newFile = appendToEndOfFile(initialContent, textToAppend);
        const expectedOutput = `- [ ] an existing task
- [ ] a new sample task
`;
        expect(newFile).toEqual(expectedOutput);
    });
});

describe('ListWriter', () => {
    it('should not modify content if appending empty string', () => {
        const initialContent = `
## Another heading
Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
`;
        const targetListHeading = '## COMPLETED TASKS';
        const textToAppend = '';
        const newFile = appendToListWithinFile(initialContent, targetListHeading, textToAppend);
        expect(newFile).toEqual(initialContent);
    });

    it('should throw error if heading is empty string', () => {
        const initialContent = `
## Another heading
Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
`;
        const targetListHeading = '';
        const textToAppend = 'A NON-EMPTY LINE';
        const t = () => {
            appendToListWithinFile(initialContent, targetListHeading, textToAppend);
        };
        expect(t).toThrow(Error);
        expect(t).toThrowError('Cannot move line to list as empty target list heading was supplied');
    });

    it('should be able to prepend to an existing list', () => {
        const initialContent = `
## Tasks ToBeDone
- [ ] a sample task
## Completed tasks
- [-] a sample completed task
## Another heading
Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
`;
        const expectedContent = `
## Tasks ToBeDone
- [ ] a sample task
## Completed tasks
- [-] A COMPLETED TASK TO MOVE TO NAMED LIST
- [-] a sample completed task
## Another heading
Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
`;
        const targetListHeading = '## Completed tasks';
        const textToAppend = '- [-] A COMPLETED TASK TO MOVE TO NAMED LIST';
        const newFile = appendToListWithinFile(initialContent, targetListHeading, textToAppend);
        expect(newFile).toEqual(expectedContent);
    });

    it('it should create new heading (if one does not exist) at bottom of note and add line to list', () => {
        const initialContentNoNewLine = `
## Another heading
Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.`;
        const expectedContent = `
## Another heading
Sed ipsam libero qui consequuntur quaerat non atque quia ab praesentium explicabo.
## COMPLETED TASKS
- [-] A COMPLETED TASK TO MOVE TO NAMED LIST
`;
        const targetListHeading = '## COMPLETED TASKS';
        const textToAppend = '- [-] A COMPLETED TASK TO MOVE TO NAMED LIST';

        const newFile1 = appendToListWithinFile(initialContentNoNewLine, targetListHeading, textToAppend);
        expect(newFile1).toEqual(expectedContent);

        const newFile2 = appendToListWithinFile(initialContentNoNewLine + newLineChar, targetListHeading, textToAppend);
        expect(newFile2).toEqual(expectedContent);
    });
});

function appendToListWithinFile(initialContent: string, targetListHeading: string, textToAppend: string) {
    if (textToAppend.length === 0) {
        return initialContent;
    }
    if (targetListHeading === '') {
        throw Error('Cannot move line to list as empty target list heading was supplied');
    }
    let result = initialContent;
    if (result.length > 0 && !result.endsWith(newLineChar)) {
        result += newLineChar;
    }
    const linesArray = initialContent.split('\n');
    const headingLine = linesArray.indexOf(targetListHeading);
    if (headingLine === -1) {
        result += targetListHeading + newLineChar + textToAppend + newLineChar;
    } else {
        linesArray[headingLine] += newLineChar + textToAppend;
        result = linesArray.join(newLineChar);
    }
    return result;
}
