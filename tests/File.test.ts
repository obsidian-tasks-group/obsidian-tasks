import { readFileSync } from 'fs';
import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import { findLineNumberOfTaskToToggle } from '../src/File';
import type { MockTogglingDataForTesting } from '../src/lib/MockDataCreator';

function testFindLineNumberOfTaskToToggle(
    jsonFileName: string,
    taskLineToToggle: string,
    expectedLineNumber: number | undefined,
    actualIncorrectLineFound?: string,
) {
    // Arrange
    const data = readFileSync('tests/__test_data__/MockDataForTogglingTasks/' + jsonFileName, 'utf-8');
    const everything: MockTogglingDataForTesting = JSON.parse(data);
    expect(everything.taskData.originalMarkdown).toEqual(taskLineToToggle);

    // Act
    const originalTask = everything.taskData;
    const fileLines = everything.fileData.fileLines;
    const listItemsCache = everything.cacheData.listItemsCache;

    let errorString: string | undefined;
    const captureError = (message: string) => {
        errorString = message;
    };

    const result = findLineNumberOfTaskToToggle(
        originalTask,
        fileLines,
        listItemsCache,
        captureError.bind(errorString),
    );

    // Assert
    verify(errorString);

    if (expectedLineNumber !== undefined) {
        expect(result).not.toBeUndefined();
        expect(result).toEqual(expectedLineNumber);

        const expectedLine = actualIncorrectLineFound ? actualIncorrectLineFound : everything.taskData.originalMarkdown;
        expect(everything.fileData.fileLines[result!]).toEqual(expectedLine);
    } else {
        expect(result).toBeUndefined();
    }
}

describe('replaceTaskWithTasks', () => {
    // --------------------------------------------------------------------------------
    // Issue 688
    describe('issue 688 - block referenced task', () => {
        const jsonFileName = '688_toggle_block_referenced_line_overwrites_wrong_line.json';
        const taskLineToToggle = '- [ ] #task task2b ^ca47c7';

        it.failing('correct behaviour', () => {
            // An incorrect line is currently found, so this test fails, due to bug 688
            const expectedLineNumber = 8;
            testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
        });

        it('current incorrect behaviour', () => {
            // An incorrect line is currently found, due to bug 688.
            // It is recognised as an incorrect line, and so line number is returned as undefined.
            const expectedLineNumber = undefined;
            // const actualIncorrectLineFound = '- [ ] #task task1a';
            testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
        });
    });

    // --------------------------------------------------------------------------------
});
