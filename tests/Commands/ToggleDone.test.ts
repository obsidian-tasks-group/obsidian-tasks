/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import type { EditorPosition } from 'obsidian';
import { getNewCursorPosition, toggleLine } from '../../src/Commands/ToggleDone';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';
import { Status } from '../../src/Statuses/Status';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';

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
        GlobalFilter.getInstance().reset();
    });

    const todaySpy = jest.spyOn(Date, 'now').mockReturnValue(moment('2022-09-04').valueOf());

    // The | (pipe) indicates the calculated position where the cursor should be displayed.
    // Note that prior to the #1103 fix, this position was sometimes ignored.

    // Most of the tests are run twice. The second time, they are tested with tasks that
    // do not match the global filter.

    it('should add hyphen and space to empty line', () => {
        testToggleLine('|', '- |');
        testToggleLine('foo|bar', '- foobar|');

        GlobalFilter.getInstance().set('#task');

        testToggleLine('|', '- |');
        testToggleLine('foo|bar', '- foobar|');
    });

    it('should add checkbox to hyphen and space', () => {
        testToggleLine('|- ', '- [ ] |');
        testToggleLine('- |', '- [ ] |');
        testToggleLine('- |foobar', '- [ ] foobar|');

        GlobalFilter.getInstance().set('#task');

        testToggleLine('|- ', '- [ ] |');
        testToggleLine('- |', '- [ ] |');
        testToggleLine('- |foobar', '- [ ] foobar|');
    });

    it('should complete a task', () => {
        testToggleLine('|- [ ] ', '|- [x]  ✅ 2022-09-04');
        testToggleLine('- [ ] |', '- [x] | ✅ 2022-09-04');

        // Issue #449 - cursor jumped 13 characters to the right on completion
        testToggleLine('- [ ] I have a |proper description', '- [x] I have a |proper description ✅ 2022-09-04');

        GlobalFilter.getInstance().set('#task');

        testToggleLine('|- [ ] ', '|- [x] ');
        testToggleLine('- [ ] |', '- [x] |');

        // Issue #449 - cursor jumped 13 characters to the right on completion
        testToggleLine('- [ ] I have a |proper description', '- [x] I have a |proper description');
    });

    it('should un-complete a completed task', () => {
        testToggleLine('|- [x]  ✅ 2022-09-04', '|- [ ] ');
        testToggleLine('- [x]  ✅ 2022-09-04|', '- [ ] |');

        // Issue #449 - cursor jumped 13 characters to the left on un-completion
        testToggleLine('- [x] I have a proper description| ✅ 2022-09-04', '- [ ] I have a proper description|');

        GlobalFilter.getInstance().set('#task');

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

        GlobalFilter.getInstance().set('#task');

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
            GlobalFilter.getInstance().reset();
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
            GlobalFilter.getInstance().set('#task');

            const line1 = '- [C] #task this is a task starting at Con';

            // Assert
            const line2 = toggleLine(line1, 'x.md').text;
            expect(line2).toStrictEqual('- [P] #task this is a task starting at Con');

            const line3 = toggleLine(line2, 'x.md').text;
            expect(line3).toStrictEqual('- [C] #task this is a task starting at Con');
        });

        it('when there is a global filter and task without global filter is toggled', () => {
            GlobalFilter.getInstance().set('#task');

            const line1 = '- [P] this is a task starting at Pro, not matching the global filter';

            // Assert
            const line2 = toggleLine(line1, 'x.md').text;
            expect(line2).toStrictEqual('- [C] this is a task starting at Pro, not matching the global filter');

            const line3 = toggleLine(line2, 'x.md').text;
            expect(line3).toStrictEqual('- [P] this is a task starting at Pro, not matching the global filter');
        });
    });

    describe('should proceed through the statuses until a TODO status is reached', () => {
        it('should proceed through the statuses until a TODO status is reached when a task is completed', () => {
            // Arrange
            const statusRegistry = StatusRegistry.getInstance();
            statusRegistry.resetToDefaultStatuses();
            statusRegistry.set([
                new Status(new StatusConfiguration('x', 'Done', '-', false, StatusType.DONE)),
                ...statusRegistry.registeredStatuses,
            ]);

            testToggleLine(
                '- [ ] Recurring task should start with TODO| 🔁 every day 📅 2022-09-04 ',
                `- [ ] Recurring task should start with TODO 🔁 every day 📅 2022-09-05
- [x] Recurring task should start with TODO| 🔁 every day 📅 2022-09-04 ✅ 2022-09-04`,
            );
        });

        it('should not get stuck in a loop when a task is completed', () => {
            // Arrange
            const statusRegistry = StatusRegistry.getInstance();
            statusRegistry.resetToDefaultStatuses();
            statusRegistry.set([
                new Status(new StatusConfiguration('1', '1', '2', false, StatusType.IN_PROGRESS)),
                new Status(new StatusConfiguration('2', '2', '1', false, StatusType.DONE)),
            ]);

            testToggleLine(
                '- [1] Recurring task should start with TODO| 🔁 every day 📅 2022-09-04 ',
                `- [1] Recurring task should start with TODO 🔁 every day 📅 2022-09-05
- [2] Recurring task should start with TODO| 🔁 every day 📅 2022-09-04 ✅ 2022-09-04`,
            );
        });
    });

    todaySpy.mockClear();
});
