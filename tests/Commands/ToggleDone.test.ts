/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import {
    calculateCursorOffset,
    toggleLine,
} from '../../src/Commands/ToggleDone';

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
function testToggleLine(
    inputWithCursorMark: string,
    expectedWithCursorMark: string,
) {
    const cursorMarker = '|';
    const cursorMarkerRegex = /\|/g;

    const input = inputWithCursorMark.replace(cursorMarkerRegex, '');
    const expected = expectedWithCursorMark.replace(cursorMarkerRegex, '');

    // Check that the cursor marker appears exactly once in each input string:
    expect(input.length).toEqual(inputWithCursorMark.length - 1);
    expect(expected.length).toEqual(expectedWithCursorMark.length - 1);

    testToggleLineForOutOfRangeCursorPositions(
        input,
        inputWithCursorMark.indexOf(cursorMarker),
        expected,
        expectedWithCursorMark.indexOf(cursorMarker),
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
    initialCursorOffset: number,
    expected: string,
    expectedCursorOffset: number,
) {
    const result = toggleLine(input, 'x.md');
    expect(result).toStrictEqual(expected);
    const actualCursorOffset = calculateCursorOffset(
        initialCursorOffset,
        input,
        result,
    );
    expect(actualCursorOffset).toEqual(expectedCursorOffset);
}

describe('ToggleDone', () => {
    const todaySpy = jest
        .spyOn(Date, 'now')
        .mockReturnValue(moment('2022-09-04').valueOf());

    // The | (pipe) indicates the calculated position where the cursor should be displayed.
    // Note that prior to the #1103 fix, this position was sometimes ignored.

    it('should add hyphen and space to empty line', () => {
        testToggleLine('|', '- |');
    });

    it('should add checkbox to hyphen and space', () => {
        testToggleLine('|- ', '- [ |] ');
        testToggleLine('- |', '- [ ] |');
    });

    it('should complete a task', () => {
        testToggleLine('|- [ ] ', '|- [x]  ✅ 2022-09-04');
        testToggleLine('- [ ] |', '- [x] | ✅ 2022-09-04');

        // Issue #449 - cursor jumped 13 characters to the right on completion
        testToggleLine(
            '- [ ] I have a |proper description',
            '- [x] I have a |proper description ✅ 2022-09-04',
        );
    });

    it('should un-complete a completed task', () => {
        testToggleLine('|- [x]  ✅ 2022-09-04', '|- [ ] ');
        testToggleLine('- [x]  ✅ 2022-09-04|', '- [ ] |');

        // Issue #449 - cursor jumped 13 characters to the left on un-completion
        testToggleLine(
            '- [x] I have a proper description| ✅ 2022-09-04',
            '- [ ] I have a proper description|',
        );
    });

    it('should complete a recurring task', () => {
        testToggleLine(
            '- [ ] I am a recurring task| 🔁 every day 📅 2022-09-04',
            `- [ ] I am a recurring task 🔁 every day 📅 2022-09-05
- [x] I am a recurring task| 🔁 every day 📅 2022-09-04 ✅ 2022-09-04`,
        );

        // With a trailing space at the end of the initial line, which is deleted
        // when the task lines are regenerated, the cursor moves one character to the left:
        testToggleLine(
            '- [ ] I am a recurring task| 🔁 every day 📅 2022-09-04 ',
            `- [ ] I am a recurring task 🔁 every day 📅 2022-09-05
- [x] I am a recurring tas|k 🔁 every day 📅 2022-09-04 ✅ 2022-09-04`,
        );
    });

    todaySpy.mockClear();
});
