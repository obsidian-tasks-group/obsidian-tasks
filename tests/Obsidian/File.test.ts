import { readFileSync } from 'fs';
import moment from 'moment';
import type { MetadataCache, Workspace } from 'obsidian';
import { verify } from '@approval-tests/approvals/lib/Providers/Vitest/VitestApprovals';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import { findLineNumberOfTaskToToggle, initializeFile, replaceTaskWithTasks } from '../../src/Obsidian/File';
import type { MockTogglingDataForTesting } from '../../src/lib/MockDataCreator';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { Task } from '../../src/Task/Task';
import { TaskLocation } from '../../src/Task/TaskLocation';
import { FakeVault } from '../TestingTools/FakeVault';

window.moment = moment;

/**
 * A function to help test File.findLineNumberOfTaskToToggle()
 *
 * It uses mock data to simulate user behaviour.
 *
 * This is a fragile method of testing, but right now is better than no automated
 * testing at all.
 *
 * Input files for {@link jsonFileName} are in `tests/__test_data__/MockDataForTogglingTasks`
 * They are created by:
 *   1. setting logDataForMocking to true in File.ts.
 *   2. Running a local build on the plugin
 *   3. Showing the console
 *   4. Setting up a small markdown file with the scenario to test
 *   5. Working the steps required to make the toggle operation fail
 *   6. Grabbing the console output
 *   7. Pasting it in to a new JSON file in `tests/__test_data__/MockDataForTogglingTasks`
 *   8. Auto-formatting the JSON so that it is readable.
 * @param jsonFileName
 * @param taskLineToToggle
 * @param expectedLineNumber
 * @param actualIncorrectLineFound - optional, only needed if the wrong line would be toggled.
 */
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
    let descriptionOfOutcome = '';
    if (errorString !== undefined) {
        descriptionOfOutcome = errorString;
    } else if (result === undefined) {
        descriptionOfOutcome = 'Could not find line for task';
    } else {
        descriptionOfOutcome = 'Success. Line found OK. No error reported.';
    }
    verify(descriptionOfOutcome);

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
    it('valid 2-task test', () => {
        const jsonFileName = 'single_task_valid_data.json';
        const taskLineToToggle = '- [ ] #task task 2';
        const expectedLineNumber = 5;
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
    });

    // --------------------------------------------------------------------------------
    // Issue 688
    it('issue 688 - block referenced task', () => {
        const jsonFileName = '688_toggle_block_referenced_line_overwrites_wrong_line.json';
        const taskLineToToggle = '- [ ] #task task2b ^ca47c7';

        const expectedLineNumber = 8;
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
    });

    // --------------------------------------------------------------------------------
    // Issue 1680
    it('issue 1680 - Cannot read properties of undefined', () => {
        const jsonFileName = '1680_task_line_number_past_end_of_file.json';
        const taskLineToToggle = '- [ ] #task Section 2/Task 2';

        const expectedLineNumber = 9;
        testFindLineNumberOfTaskToToggle(jsonFileName, taskLineToToggle, expectedLineNumber);
    });

    // --------------------------------------------------------------------------------
});

describe('replaceTaskWithTasks with a to_file task', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-02-11'));
    });

    afterEach(() => {
        vi.useRealTimers();
        resetSettings();
    });

    it.each([false, true])(
        'should leave the next occurrence in the note and move the completed instance, with recurrenceOnNextLine %s',
        async (recurrenceOnNextLine: boolean) => {
            updateSettings({ recurrenceOnNextLine });
            const line = '- [ ] Water the plants 🔁 every day 🏁 to_file 📅 2024-02-10';
            const vault = new FakeVault();
            vault.files.set('Plants.md', `# Plants\n${line}\n- [ ] Repot the fern\n`);
            const metadataCache = { getFileCache: () => ({ listItems: [{}] }) } as unknown as MetadataCache;
            initializeFile({ metadataCache, vault: vault.asVault(), workspace: {} as Workspace });
            const task = Task.fromLine({
                line,
                taskLocation: new TaskLocation(new TasksFile('Plants.md'), 1, 1, 0, 'Plants'),
                fallbackDate: null,
            })!;

            await replaceTaskWithTasks({ originalTask: task, newTasks: task.toggleWithRecurrenceInUsersOrder() });

            expect(vault.files.get('Plants.md')).toEqual(
                '# Plants\n- [ ] Water the plants 🔁 every day 🏁 to_file 📅 2024-02-11\n- [ ] Repot the fern\n',
            );
            expect(vault.files.get('Completed Tasks.md')).toEqual(
                '- [x] Water the plants 🔁 every day 🏁 to_file 📅 2024-02-10 ✅ 2024-02-11\n',
            );
        },
    );
});
