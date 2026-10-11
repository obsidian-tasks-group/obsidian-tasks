import { MockDataLoader } from '../TestingTools/MockDataLoader';
import type { Task } from '../../src/Task/Task';
import { type SimulatedFile, getMockDataAndReadTasks, readTasksFromSimulatedFile } from './SimulatedFile';
import type { MockDataName } from './AllCacheSampleData';

describe('FileParser', () => {
    it('should set all non-TasksFile data in TaskLocation', () => {
        // This test exists to detect accidental changes to the task-reading code.
        // I found that intentionally breaking the setting of _sectionIndex was
        // not caught by any other tests.

        // begin-snippet: readTasksFromSimulatedFile
        const tasks = readTasksFromSimulatedFile('multiple_headings');
        // end-snippet
        const locationDataExceptTasksFile = tasks.map((task) => task.taskLocation.allFieldsExceptTasksFileForTesting());
        expect(locationDataExceptTasksFile).toMatchInlineSnapshot(`
            [
              {
                "_lineNumber": 6,
                "_precedingHeader": "Level 2 heading",
                "_sectionIndex": 0,
                "_sectionStart": 6,
              },
              {
                "_lineNumber": 7,
                "_precedingHeader": "Level 2 heading",
                "_sectionIndex": 1,
                "_sectionStart": 6,
              },
              {
                "_lineNumber": 11,
                "_precedingHeader": "Level 2 heading",
                "_sectionIndex": 0,
                "_sectionStart": 11,
              },
              {
                "_lineNumber": 15,
                "_precedingHeader": "Level 3 heading",
                "_sectionIndex": 0,
                "_sectionStart": 15,
              },
              {
                "_lineNumber": 16,
                "_precedingHeader": "Level 3 heading",
                "_sectionIndex": 1,
                "_sectionStart": 15,
              },
            ]
        `);
    });

    it('does not read task lines beginning with a ZWSP - zero-width space', () => {
        // Demo the behaviour of Obsidian when then Simple Tab Indent plugin indents what looks like a task line.
        // https://github.com/hoomersinpsom/simple-tab-indent
        const testDataName = 'zero_width';
        const data = MockDataLoader.get(testDataName);
        expect(data.fileContents).toContain("- [ ] #task Task line 1 in 'zero_width' - indented by tab character");
        expect(data.fileContents).toContain(
            "- [ ] #task Task line 2 in 'zero_width' - indented by ZWSP + tab character",
        );
        const tasks = readTasksFromSimulatedFile(testDataName);
        expect(tasks.length).toEqual(1);
        expect(tasks[0].description).toEqual("#task Task line 1 in 'zero_width' - indented by tab character");
    });

    it('readTasksFromSimulatedFile() should preserve file path', () => {
        const tasks = readTasksFromSimulatedFile('numbered_list_items_with_paren');
        expect(tasks[0].path).toEqual('Test Data/numbered_list_items_with_paren.md');
    });

    it('readTasksFromSimulatedFile() should preserve metadata', () => {
        const tasks = readTasksFromSimulatedFile('yaml_custom_number_property');
        expect(tasks[0].taskLocation.tasksFile.cachedMetadata.frontmatter).toMatchInlineSnapshot(`
            {
              "custom_number_prop": 42,
            }
        `);
    });
});

describe('understand task parsing', () => {
    function taskCountAccordingToObsidianCache(data: SimulatedFile): number | undefined {
        return data.cachedMetadata.listItems?.length;
    }

    function taskCountAccordingToTasks(tasks: Task[]): number {
        return tasks.length;
    }

    type ParsingExample = {
        mockDataName: MockDataName;
        expectedFileContents: string;
        expectedObsidianCount: number;
        expectedTasksCount: number;
    };

    const parsingExamples = [
        {
            mockDataName: 'list_items_nested_issue_4081_numbered',
            expectedFileContents: `
1. 1. [ ] A - 4081 task 1
    1. [ ] B - 4081 task 1.1

2. 1. [ ] A - 4081 task 2
    1. [ ] B - 4081 task 2.1
`,
            // file content suggests these should both be 4:
            expectedObsidianCount: 6,
            expectedTasksCount: 2,
        },
        {
            mockDataName: 'list_items_nested_issue_4081_unnumbered',
            expectedFileContents: `
* * [ ] A - 4081 task 1
    * [ ] B - 4081 task 1.1
`,
            // file content suggests these should both be 2:
            expectedObsidianCount: 3,
            expectedTasksCount: 1,
        },
    ] satisfies readonly ParsingExample[];

    it.each(parsingExamples)(
        'show how Obsidian parses file - $mockDataName',
        ({ mockDataName, expectedFileContents, expectedObsidianCount, expectedTasksCount }) => {
            const { data, tasks } = getMockDataAndReadTasks(mockDataName);
            expect('\n' + data.fileContents).toEqual(expectedFileContents);
            expect(taskCountAccordingToObsidianCache(data)).toEqual(expectedObsidianCount);
            expect(taskCountAccordingToTasks(tasks)).toEqual(expectedTasksCount);
        },
    );
});
