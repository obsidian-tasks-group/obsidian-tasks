import { readTasksFromSimulatedFile } from './SimulatedFile';
import multiple_headings from './__test_data__/multiple_headings.json';

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
});
