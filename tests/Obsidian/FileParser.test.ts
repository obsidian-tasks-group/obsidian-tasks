import type { CachedMetadata, ListItemCache } from 'obsidian';
import { FileParser } from '../../src/Obsidian/FileParser';
import type { TasksFile } from '../../src/Scripting/TasksFile';
import { logging } from '../../src/lib/logging';
import { MockDataLoader } from '../TestingTools/MockDataLoader';
import { readTasksFromSimulatedFile } from './SimulatedFile';

describe('FileParser', () => {
    it('ignores stale non-list cache entries without changing supported list parsing', () => {
        const lines = [
            '# Heading',
            'Prose line',
            '',
            '- parent list item',
            '  - [ ] child task',
            '+ plus list item',
            '* star list item',
            '> - quoted list item',
            '1. numbered list item',
            '1) alternate numbered list item',
        ];
        const position = (line: number) => ({
            start: { line, col: 0, offset: 0 },
            end: { line, col: lines[line].length, offset: lines[line].length },
        });
        const listItems: ListItemCache[] = lines.map((_line, line) => ({
            parent: line === 4 ? 3 : -1,
            position: position(line),
        }));
        listItems[4].task = ' ';
        const cachedMetadata: CachedMetadata = {
            listItems,
            sections: [
                { type: 'paragraph', position: { start: position(0).start, end: position(lines.length - 1).end } },
            ],
        };
        const logger = logging.getLogger('FileParser.test');
        const warn = jest.spyOn(logger, 'warn');
        const debug = jest.spyOn(logger, 'debug');
        const tasksFile = { path: 'stale-cache.md', cachedMetadata } as TasksFile;
        const parser = new FileParser(tasksFile, lines.join('\n'), listItems, logger, jest.fn());

        const tasks = parser.parseFileContent();

        expect(warn).not.toHaveBeenCalled();
        expect(debug).toHaveBeenCalledTimes(3);
        expect(tasks).toHaveLength(1);
        expect(tasks[0].parent?.description).toEqual('parent list item');
    });

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
