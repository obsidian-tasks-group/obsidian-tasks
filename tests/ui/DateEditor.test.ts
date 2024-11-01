/**
 * @jest-environment jsdom
 */
import { type RenderResult, fireEvent, render } from '@testing-library/svelte';
import moment from 'moment/moment';
import { TASK_FORMATS } from '../../src/Config/Settings';
import DateEditor from '../../src/ui/DateEditor.svelte';
import DateEditorWrapper from './DateEditorWrapper.svelte';

import { getAndCheckRenderedElement } from './RenderingTestHelpers';

window.moment = moment;

function renderDateEditor() {
    const result: RenderResult<DateEditor> = render(DateEditor, {
        id: 'due',
        dateSymbol: TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols.dueDateSymbol,
        date: '',
        isDateValid: true,
        forwardOnly: true,
        accesskey: 'D',
    });

    const { container } = result;
    expect(() => container).toBeTruthy();
    return { result, container };
}

describe('date editor tests', () => {
    it('should render and read input value', async () => {
        const { container } = renderDateEditor();
        const dueDateInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'due');

        expect(dueDateInput.value).toEqual('');

        await fireEvent.input(dueDateInput, { target: { value: '2024-10-01' } });

        expect(dueDateInput.value).toEqual('2024-10-01');
    });
});

function renderDateEditorWrapper() {
    const result: RenderResult<DateEditorWrapper> = render(DateEditorWrapper, {});

    const { container } = result;
    expect(() => container).toBeTruthy();
    return { result, container };
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-04-20'));
});

afterEach(() => {
    jest.useRealTimers();
});

function testInputValue(container: HTMLElement, inputId: string, expectedText: string) {
    const input = getAndCheckRenderedElement<HTMLInputElement>(container, inputId);
    expect(input.value).toEqual(expectedText);
}

async function testTypingInput({
    userTyped,
    expectedLeftText,
    expectedRightText,
    expectedReturnedDate,
}: {
    userTyped: string;
    expectedLeftText: string;
    expectedRightText: string;
    expectedReturnedDate: string;
}) {
    const { container } = renderDateEditorWrapper();

    const dueDateInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'due');
    await fireEvent.input(dueDateInput, { target: { value: userTyped } });

    testInputValue(container, 'due', expectedLeftText);
    testInputValue(container, 'parsedDateFromDateEditor', expectedRightText);
    testInputValue(container, 'dueDateFromDateEditor', expectedReturnedDate);
}

describe('date editor wrapper tests', () => {
    it('should initialise fields correctly', () => {
        const { container } = renderDateEditorWrapper();

        testInputValue(container, 'due', '');
        testInputValue(container, 'parsedDateFromDateEditor', '<i>no due date</i>');
        testInputValue(container, 'dueDateFromDateEditor', '');
    });

    it('should replace an empty date field with typed date value', async () => {
        await testTypingInput({
            userTyped: '2024-10-01',
            expectedLeftText: '2024-10-01',
            expectedRightText: '2024-10-01',
            expectedReturnedDate: '2024-10-01',
        });
    });

    it('should replace an empty date field with typed abbreviation', async () => {
        await testTypingInput({
            userTyped: 'tm ',
            expectedLeftText: 'tomorrow',
            expectedRightText: '2024-04-21',
            expectedReturnedDate: 'tomorrow',
        });
    });

    it('should show an error message for invalid date', async () => {
        await testTypingInput({
            userTyped: 'blah',
            expectedLeftText: 'blah',
            expectedRightText: '<i>invalid due date</i>',
            expectedReturnedDate: 'blah',
        });
    });
});
