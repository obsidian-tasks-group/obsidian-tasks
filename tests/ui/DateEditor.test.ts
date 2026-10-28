import { fireEvent, render } from '@testing-library/svelte';
import moment from 'moment/moment';
import DateEditorWrapper from './DateEditorWrapper.svelte';

import { getAndCheckRenderedElement } from './RenderingTestHelpers';

window.moment = moment;

function renderDateEditorWrapper(componentOptions: { forwardOnly: boolean }) {
    const { container } = render(DateEditorWrapper, componentOptions);

    expect(() => container).toBeTruthy();

    return container;
}

function testInputValue(container: HTMLElement, inputId: string, expectedText: string) {
    const input = getAndCheckRenderedElement<HTMLInputElement>(container, inputId);
    expect(input.value).toEqual(expectedText);
}

function testDatePickerValue(container: HTMLElement, expectedValue: string) {
    const datePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'date-editor-picker');
    expect(datePicker.value).toEqual(expectedValue);
}

async function testTypingInput(
    {
        userTyped,
        expectedLeftText,
        expectedRightText,
        expectedReturnedDate,
        expectedReturnedDateValidity = 'true',
    }: {
        userTyped: string;
        expectedLeftText: string;
        expectedRightText: string;
        expectedReturnedDate: string;
        expectedReturnedDateValidity?: 'true' | 'false';
    },
    { forwardOnly }: { forwardOnly: boolean } = { forwardOnly: true },
) {
    const container = renderDateEditorWrapper({ forwardOnly });

    const dueDateInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'due');
    await fireEvent.input(dueDateInput, { target: { value: userTyped } });

    testInputValue(container, 'due', expectedLeftText);
    testInputValue(container, 'parsedDateFromDateEditor', expectedRightText);
    testInputValue(container, 'dueDateFromDateEditor', expectedReturnedDate);
    testInputValue(container, 'parsedDateValidFromDateEditor', expectedReturnedDateValidity);

    if (expectedReturnedDateValidity === 'true') {
        testDatePickerValue(container, expectedRightText.slice(0, 10));
    } else {
        const datePicker = container.ownerDocument.getElementById('date-editor-picker') as HTMLInputElement;
        expect(datePicker).toBeNull();
    }
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-04-20'));
});

afterEach(() => {
    vi.useRealTimers();
});

describe('date editor wrapper tests', () => {
    it('should initialise fields correctly', () => {
        const container = renderDateEditorWrapper({ forwardOnly: true });

        testInputValue(container, 'due', '');
        testInputValue(container, 'parsedDateFromDateEditor', '<i>no due date</i>');
        testInputValue(container, 'dueDateFromDateEditor', '');

        testDatePickerValue(container, '');
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
            expectedReturnedDateValidity: 'false',
        });
    });

    it('should select a forward date', async () => {
        await testTypingInput(
            {
                userTyped: 'friday',
                expectedLeftText: 'friday',
                expectedRightText: '2024-04-26',
                expectedReturnedDate: 'friday',
            },
            { forwardOnly: true },
        );
    });

    it('should select a backward/earlier date', async () => {
        await testTypingInput(
            {
                userTyped: 'friday',
                expectedLeftText: 'friday',
                expectedRightText: '2024-04-19',
                expectedReturnedDate: 'friday',
            },
            { forwardOnly: false },
        );
    });

    it('should pick a date', async () => {
        const container = renderDateEditorWrapper({ forwardOnly: false });
        const datePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'date-editor-picker');

        await fireEvent.input(datePicker, { target: { value: '2024-11-03' } });

        expect(datePicker.value).toEqual('2024-11-03');

        testInputValue(container, 'due', '2024-11-03');
        testInputValue(container, 'parsedDateFromDateEditor', '2024-11-03');
        testInputValue(container, 'dueDateFromDateEditor', '2024-11-03');
        testInputValue(container, 'parsedDateValidFromDateEditor', 'true');
    });

    it('should keep date picker populated with YYYY-MM-DD and preserve time when picking a new date', async () => {
        const container = renderDateEditorWrapper({ forwardOnly: false });
        const dueDateInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'due');
        await fireEvent.input(dueDateInput, { target: { value: '2024-10-01T20:20' } });

        testInputValue(container, 'parsedDateFromDateEditor', '2024-10-01T20:20');
        testDatePickerValue(container, '2024-10-01');

        const datePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'date-editor-picker');
        await fireEvent.input(datePicker, { target: { value: '2024-11-03' } });

        testInputValue(container, 'due', '2024-11-03T20:20');
        testInputValue(container, 'parsedDateFromDateEditor', '2024-11-03T20:20');
        testInputValue(container, 'dueDateFromDateEditor', '2024-11-03T20:20');
    });

    it.each(['2026-10-23 25:00', '2026-10-23 24:00', '2026-10-23 14:300'])(
        'should show an error message for date with invalid time: %s',
        async (invalidInput) => {
            await testTypingInput({
                userTyped: invalidInput,
                expectedLeftText: invalidInput,
                expectedRightText: '<i>invalid due date</i>',
                expectedReturnedDate: invalidInput,
                expectedReturnedDateValidity: 'false',
            });
        },
    );

    it.each([
        ['now', '2024-04-20 10:15'],
        ['tonight', '2024-04-20'],
        ['noon', '2024-04-20'],
        ['14:30 tomorrow', '2024-04-21 14:30'],
        ['tomorrow 9:30', '2024-04-21 09:30'],
        ['tomorrow 2pm', '2024-04-21 14:00'],
        ['tomorrow at 14:30', '2024-04-21 14:30'],
        ['next friday 09:00', '2024-04-26 09:00'],
        ['2024-10-01 14:30:45', '2024-10-01 14:30'],
    ])('should preserve typed time for natural language input "%s"', async (typedInput, expectedParsed) => {
        vi.setSystemTime(new Date(2024, 3, 20, 10, 15));
        await testTypingInput({
            userTyped: typedInput,
            expectedLeftText: typedInput,
            expectedRightText: expectedParsed,
            expectedReturnedDate: typedInput,
        });
    });

    it.each([
        ['in 2 hours', '2024-04-20 12:15'],
        ['in 2 days', '2024-04-22'],
    ])('should accept "%s" when forwardOnly is false', async (typedInput, expectedParsed) => {
        vi.setSystemTime(new Date(2024, 3, 20, 10, 15));
        await testTypingInput(
            {
                userTyped: typedInput,
                expectedLeftText: typedInput,
                expectedRightText: expectedParsed,
                expectedReturnedDate: typedInput,
            },
            { forwardOnly: false },
        );
    });

    it.each(['in 2 hours', 'in 2 days'])(
        'should reject "%s" when forwardOnly is true (chrono forwardDate prefix quirk)',
        async (typedInput) => {
            vi.setSystemTime(new Date(2024, 3, 20, 10, 15));
            await testTypingInput(
                {
                    userTyped: typedInput,
                    expectedLeftText: typedInput,
                    expectedRightText: '<i>invalid due date</i>',
                    expectedReturnedDate: typedInput,
                    expectedReturnedDateValidity: 'false',
                },
                { forwardOnly: true },
            );
        },
    );
});
