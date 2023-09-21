/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import type { EditorPosition } from 'obsidian';
import { getNewCursorPosition, toggleLine } from '../../src/Commands/ToggleDone';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { StatusRegistry } from '../../src/StatusRegistry';
import { Status } from '../../src/Status';
import { StatusConfiguration } from '../../src/StatusConfiguration';
import { updateSettings } from '../../src/Config/Settings';

window.moment = moment;

/**
 * Test that toggling the task on the given input line generates the correct
 * text content, and also gives the correct expected new cursor position.
 *
 * Cursor positions are indicated by a | (pipe) character for easy visualisation
 * of the cursor position.
 *
 * @param inputWithCursorMark
 * @param expectedWithCursorMark
 */
function testToggleLine(inputWithCursorMark: string, expectedWithCursorMark: string) {
    const cursorMarker = '|';
    const cursorMarkerRegex = /\|/g;

    const input = inputWithCursorMark.replace(cursorMarkerRegex, '');
    const expected = expectedWithCursorMark.replace(cursorMarkerRegex, '');

    // Check that the cursor marker appears exactly once in each input string:
    expect(input.length).toEqual(inputWithCursorMark.length - 1);
    expect(expected.length).toEqual(expectedWithCursorMark.length - 1);

    const cursorPosition = (s: string): EditorPosition => {
        // Split input string on cursor marker, and make array of lines
        const linesBeforeCursor = s.split(cursorMarker, 1)[0].split('\n');
        // Cursor was positioned at the end of the last line
        const line = linesBeforeCursor.length - 1;
        const ch = linesBeforeCursor[line].length;
        return { line, ch };
    };

    testToggleLineForOutOfRangeCursorPositions(
        input,
        cursorPosition(inputWithCursorMark),
        expected,
        cursorPosition(expectedWithCursorMark),
    );
}

/**
 * Test that toggling the task on the given input line generates the correct
 * text content, and also gives the correct expected new cursor position.
 *
 * Cursor positions are given by indices, where 0 is the start of the line.
 *
 * Call this version to represent a cursor position outside of the allowed
 * range of character positions in the input or expected strings.
 *
 * @param input
 * @param initialCursorOffset
 * @param expected
 * @param expectedCursorOffset
 */
function testToggleLineForOutOfRangeCursorPositions(
    input: string,
    initialCursorOffset: EditorPosition,
    expected: string,
    expectedCursorOffset: EditorPosition,
) {
    const result = toggleLine(input, 'x.md');
    expect(result.text).toStrictEqual(expected);
    const actualCursorOffset = getNewCursorPosition(initialCursorOffset, result);
    expect(actualCursorOffset).toEqual(expectedCursorOffset);
}

describe('ToggleDone', () => {
    afterEach(() => {
        GlobalFilter.reset();
        updateSettings({ autoInsertGlobalFilter: false });
    });

    const todaySpy = jest.spyOn(Date, 'now').mockReturnValue(moment('2022-09-04').valueOf());

    // The | (pipe) indicates the calculated position where the cursor should be displayed.
    // Note that prior to the #1103 fix, this position was sometimes ignored.

    // Most of the tests are run twice. The second time, they are tested with tasks that
    // do not match the global filter.

    it('should add hyphen and space to empty line', () => {
        testToggleLine('|', '- |');
        testToggleLine('foo|bar', '- foobar|');

        GlobalFilter.set('#task');

        testToggleLine('|', '- |');
        testToggleLine('foo|bar', '- foobar|');
    });

    describe('should add checkbox to hyphen and space', () => {
        it('if autoInsertGlobalFilter is false, then an empty global filter is not added', () => {
            GlobalFilter.set('');
            updateSettings({ autoInsertGlobalFilter: false });

            testToggleLine('|- ', '- [ ] |');
            testToggleLine('- |', '- [ ] |');
            testToggleLine('- |foobar', '- [ ] foobar|');
        });

        it('if autoInsertGlobalFilter is true, then and empty global filter is not added', () => {
            GlobalFilter.set('');
            updateSettings({ autoInsertGlobalFilter: true });

            testToggleLine('|- ', '- [ ] |');
            testToggleLine('- |', '- [ ] |');
            testToggleLine('- |foobar', '- [ ] foobar|');
        });

        it('if autoInsertGlobalFilter is false, then a tag global filter is not added', () => {
            GlobalFilter.set('#task');
            updateSettings({ autoInsertGlobalFilter: false });

            testToggleLine('|- ', '- [ ] |');
            testToggleLine('- |', '- [ ] |');
            testToggleLine('- |foobar', '- [ ] foobar|');
            testToggleLine('- |#task', '- [ ] #task|');
            testToggleLine('- |write blog post #task', '- [ ] write blog post #task|');
        });

        it('if autoInsertGlobalFilter is true, then a tag global filter is added if absent', () => {
            GlobalFilter.set('#task');
            updateSettings({ autoInsertGlobalFilter: true });

            testToggleLine('|- ', '- [ ] #task |');
            testToggleLine('- |', '- [ ] #task |');
            testToggleLine('- |foobar', '- [ ] #task foobar|');
            testToggleLine('- |#task', '- [ ] #task|');
            testToggleLine('- |write blog post #task', '- [ ] write blog post #task|');
        });

        it('if autoInsertGlobalFilter is false, then a non-tag global filter is not added', () => {
            GlobalFilter.set('TODO');
            updateSettings({ autoInsertGlobalFilter: false });

            testToggleLine('|- ', '- [ ] |');
            testToggleLine('- |', '- [ ] |');
            testToggleLine('- |foobar', '- [ ] foobar|');
            testToggleLine('- |TODO foobar', '- [ ] TODO foobar|');
            testToggleLine('- |write blog post TODO', '- [ ] write blog post TODO|');
        });

        it('if autoInsertGlobalFilter is true, then a non-tag global filter is added if absent', () => {
            GlobalFilter.set('TODO');
            updateSettings({ autoInsertGlobalFilter: true });

            testToggleLine('|- ', '- [ ] TODO |');
            testToggleLine('- |', '- [ ] TODO |');
            testToggleLine('- |foobar', '- [ ] TODO foobar|');
            testToggleLine('- |TODO foobar', '- [ ] TODO foobar|');
            testToggleLine('- |write blog post TODO', '- [ ] write blog post TODO|');
        });

        it('regex global filter is not broken', () => {
            // Test a global filter that has special characters from regular expressions
            // if autoInsertGlobalFilter is false, then global filter is not added
            GlobalFilter.set('a.*b');
            updateSettings({ autoInsertGlobalFilter: false });

            testToggleLine('|- [ ] a.*b ', '|- [x] a.*b ✅ 2022-09-04');
            testToggleLine('- [ ] a.*b foobar |', '- [x] a.*b foobar |✅ 2022-09-04');

            GlobalFilter.set('a.*b');
            updateSettings({ autoInsertGlobalFilter: true });

            testToggleLine('|- [ ] a.*b ', '|- [x] a.*b ✅ 2022-09-04');
            testToggleLine('- [ ] a.*b foobar |', '- [x] a.*b foobar |✅ 2022-09-04');
        });
    });

    describe('should complete a task', () => {
        it('when completing a task without a global filter', () => {
            testToggleLine('|- [ ] ', '|- [x]  ✅ 2022-09-04');
            testToggleLine('- [ ] |', '- [x] | ✅ 2022-09-04');
            testToggleLine('- [ ]| ', '- [x]|  ✅ 2022-09-04');

            // Issue #449 - cursor jumped 13 characters to the right on completion
            testToggleLine('- [ ] I have a |proper description', '- [x] I have a |proper description ✅ 2022-09-04');
        });

        it('when completing a task with a tag global filter', () => {
            GlobalFilter.set('#task');

            const completesWithTaskGlobalFilter = () => {
                testToggleLine('|- [ ] ', '|- [x] ');
                testToggleLine('- [ ] |', '- [x] |');

                testToggleLine('|- [ ] #task ', '|- [x] #task ✅ 2022-09-04');
                testToggleLine('- [ ] #task foobar |', '- [x] #task foobar |✅ 2022-09-04');
            };

            updateSettings({ autoInsertGlobalFilter: true });
            completesWithTaskGlobalFilter();
            updateSettings({ autoInsertGlobalFilter: false });
            completesWithTaskGlobalFilter();

            // Issue #449 - cursor jumped 13 characters to the right on completion
            testToggleLine('- [ ] I have a |proper description', '- [x] I have a |proper description');
        });

        it('when completing a task with a non-tag global filter', () => {
            GlobalFilter.set('TODO');

            const completesWithTodoGlobalFilter = () => {
                testToggleLine('|- [ ] ', '|- [x] ');
                testToggleLine('- [ ] |', '- [x] |');

                testToggleLine('|- [ ] TODO ', '|- [x] TODO ✅ 2022-09-04');
                testToggleLine('- [ ] TODO foobar |', '- [x] TODO foobar |✅ 2022-09-04');
            };

            updateSettings({ autoInsertGlobalFilter: true });
            completesWithTodoGlobalFilter();
            updateSettings({ autoInsertGlobalFilter: false });
            completesWithTodoGlobalFilter();
        });

        it('when completing a task with a regex global filter', () => {
            // Test a global filter that has special characters from regular expressions
            GlobalFilter.set('a.*b');

            const completesWithRegexGlobalFilter = () => {
                testToggleLine('|- [ ] ', '|- [x] ');
                testToggleLine('- [ ] |', '- [x] |');

                testToggleLine('|- [ ] a.*b ', '|- [x] a.*b ✅ 2022-09-04');
                testToggleLine('- [ ] a.*b foobar |', '- [x] a.*b foobar |✅ 2022-09-04');
            };

            updateSettings({ autoInsertGlobalFilter: true });
            completesWithRegexGlobalFilter();
            updateSettings({ autoInsertGlobalFilter: false });
            completesWithRegexGlobalFilter();
        });
    });

    it('should un-complete a completed task', () => {
        testToggleLine('|- [x]  ✅ 2022-09-04', '|- [ ] ');
        testToggleLine('- [x]  ✅ 2022-09-04|', '- [ ] |');

        // Issue #449 - cursor jumped 13 characters to the left on un-completion
        testToggleLine('- [x] I have a proper description| ✅ 2022-09-04', '- [ ] I have a proper description|');

        GlobalFilter.set('#task');

        // Done date is not removed if task does not match global filter
        testToggleLine('|- [x]  ✅ 2022-09-04', '|- [ ] ✅ 2022-09-04');
        testToggleLine('- [x]  ✅ 2022-09-04|', '- [ ] ✅ 2022-09-04|');

        // Issue #449 - cursor jumped 13 characters to the left on un-completion
        testToggleLine(
            '- [x] I have a proper description| ✅ 2022-09-04',
            '- [ ] I have a proper description| ✅ 2022-09-04',
        );
    });

    it('should complete a recurring task', () => {
        testToggleLine(
            '- [ ] I am a recurring task| 🔁 every day 📅 2022-09-04',
            `- [ ] I am a recurring task 🔁 every day 📅 2022-09-05
- [x] I am a recurring task| 🔁 every day 📅 2022-09-04 ✅ 2022-09-04`,
        );

        // With a trailing space at the end of the initial line, which is deleted
        // when the task lines are regenerated, the cursor does not move one character to the left:
        testToggleLine(
            '- [ ] I am a recurring task| 🔁 every day 📅 2022-09-04 ',
            `- [ ] I am a recurring task 🔁 every day 📅 2022-09-05
- [x] I am a recurring task| 🔁 every day 📅 2022-09-04 ✅ 2022-09-04`,
        );

        GlobalFilter.set('#task');

        // Tasks do not recur, and no done-date added, if not matching global filter
        testToggleLine(
            '- [ ] I am a recurring task| 🔁 every day 📅 2022-09-04',
            '- [x] I am a recurring task| 🔁 every day 📅 2022-09-04',
        );

        // With a trailing space at the end of the initial line, which is deleted
        // when the task lines are regenerated, the cursor moves one character to the left:
        testToggleLine(
            '- [ ] I am a recurring task| 🔁 every day 📅 2022-09-04 ',
            '- [x] I am a recurring task| 🔁 every day 📅 2022-09-04 ',
        );
    });

    describe('should honour next status character', () => {
        afterEach(() => {
            GlobalFilter.reset();
        });

        // Arrange
        const statusRegistry = StatusRegistry.getInstance();
        statusRegistry.resetToDefaultStatuses();
        statusRegistry.add(new Status(new StatusConfiguration('P', 'Pro', 'C', false)));
        statusRegistry.add(new Status(new StatusConfiguration('C', 'Con', 'P', false)));

        it('when there is no global filter', () => {
            const line1 = '- [P] this is a task starting at Pro';

            // Assert
            const line2 = toggleLine(line1, 'x.md').text;
            expect(line2).toStrictEqual('- [C] this is a task starting at Pro');

            const line3 = toggleLine(line2, 'x.md').text;
            expect(line3).toStrictEqual('- [P] this is a task starting at Pro');
        });

        it('when there is a global filter and task with global filter is toggled', () => {
            GlobalFilter.set('#task');

            const line1 = '- [C] #task this is a task starting at Con';

            // Assert
            const line2 = toggleLine(line1, 'x.md').text;
            expect(line2).toStrictEqual('- [P] #task this is a task starting at Con');

            const line3 = toggleLine(line2, 'x.md').text;
            expect(line3).toStrictEqual('- [C] #task this is a task starting at Con');
        });

        it('when there is a global filter and task without global filter is toggled', () => {
            GlobalFilter.set('#task');

            const line1 = '- [P] this is a task starting at Pro, not matching the global filter';

            // Assert
            const line2 = toggleLine(line1, 'x.md').text;
            expect(line2).toStrictEqual('- [C] this is a task starting at Pro, not matching the global filter');

            const line3 = toggleLine(line2, 'x.md').text;
            expect(line3).toStrictEqual('- [P] this is a task starting at Pro, not matching the global filter');
        });
    });

    todaySpy.mockClear();
});
