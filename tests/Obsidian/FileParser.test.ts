import { readTasksFromSimulatedFile } from './SimulatedFile';
import multiple_headings from './__test_data__/multiple_headings.json';
import zero_width from './__test_data__/zero_width.json';

describe('FileParser', () => {
    it('should set all non-TasksFile data in TaskLocation', () => {
        // This test exists to detect accidental changes to the task-reading code.
        // I found that intentionally breaking the setting of _sectionIndex was
        // not caught by any other tests.

        const tasks = readTasksFromSimulatedFile(multiple_headings);
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
        const data = zero_width;
        expect(data.fileContents).toContain("- [ ] #task Task line 1 in 'zero_width' - indented by tab character");
        expect(data.fileContents).toContain(
            "- [ ] #task Task line 2 in 'zero_width' - indented by ZWSP + tab character",
        );
        const tasks = readTasksFromSimulatedFile(data);
        expect(tasks.length).toEqual(1);
        expect(tasks[0].description).toEqual("#task Task line 1 in 'zero_width' - indented by tab character");
    });
});
