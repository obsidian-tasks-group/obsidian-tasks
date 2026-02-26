import { MockDataLoader } from '../TestingTools/MockDataLoader';
import { FileParser } from '../../src/Obsidian/FileParser';
import { logging } from '../../src/lib/logging';
import { readTasksFromSimulatedFile } from './SimulatedFile';

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

    it('should return no tasks when TQ_ignore_this_file is true', () => {
        // Override obsidian mock functions for synthetic CachedMetadata
        const obsidianModule = require('obsidian');
        const originalParseFrontMatterTags = obsidianModule.parseFrontMatterTags;
        const originalGetAllTags = obsidianModule.getAllTags;
        obsidianModule.parseFrontMatterTags = () => null;
        obsidianModule.getAllTags = () => [];

        const fileContent = '---\nTQ_ignore_this_file: true\n---\n\n- [ ] This task should be ignored\n';
        const cachedMetadata = {
            frontmatter: { TQ_ignore_this_file: true } as any,
            listItems: [
                {
                    parent: -1,
                    position: {
                        start: { line: 4, col: 0, offset: 40 },
                        end: { line: 4, col: 35, offset: 75 },
                    },
                    task: ' ',
                },
            ],
            sections: [
                {
                    position: {
                        start: { line: 0, col: 0, offset: 0 },
                        end: { line: 2, col: 3, offset: 30 },
                    },
                    type: 'yaml' as const,
                },
                {
                    position: {
                        start: { line: 4, col: 0, offset: 40 },
                        end: { line: 4, col: 35, offset: 75 },
                    },
                    type: 'list' as const,
                },
            ],
        };

        const logger = logging.getLogger('testFileParser');
        const fileParser = new FileParser(
            'Test Data/ignored_file.md',
            fileContent,
            cachedMetadata.listItems!,
            logger,
            cachedMetadata as any,
            () => {},
        );

        const tasks = fileParser.parseFileContent();
        expect(tasks.length).toEqual(0);

        obsidianModule.parseFrontMatterTags = originalParseFrontMatterTags;
        obsidianModule.getAllTags = originalGetAllTags;
    });
});
