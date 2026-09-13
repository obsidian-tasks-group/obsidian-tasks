/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/svelte';
import moment from 'moment/moment';
import { resetSettings, updateSettings } from '../../src/Config/Settings';
import ReminderEditorWrapper from './ReminderEditorWrapper.svelte';
import { getAndCheckRenderedElement } from './RenderingTestHelpers';

window.moment = moment;

function renderReminderEditorWrapper() {
    const { container } = render(ReminderEditorWrapper);
    expect(() => container).toBeTruthy();
    return container;
}

function testInputValue(container: HTMLElement, inputId: string, expectedText: string) {
    const input = getAndCheckRenderedElement<HTMLInputElement>(container, inputId);
    expect(input.value).toEqual(expectedText);
}

function suggestionOptionsAsText(container: HTMLElement): string[] {
    const datalist = getAndCheckRenderedElement<HTMLDataListElement>(container, 'reminder-suggestions');
    return Array.from(datalist.options).map((option) => `${option.value} | ${option.text}`);
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-04-20T10:00:00'));
});

afterEach(() => {
    jest.useRealTimers();
    resetSettings();
});

describe('reminder editor wrapper tests', () => {
    it('should initialise fields correctly, with no reminder', () => {
        const container = renderReminderEditorWrapper();

        testInputValue(container, 'reminder', '');
        testInputValue(container, 'parsedReminderTimeFromEditor', '<i>no reminder</i>');
        testInputValue(container, 'reminderTimeFromEditor', '');
    });

    it('should not populate suggestions before the field is focused', () => {
        const container = renderReminderEditorWrapper();

        expect(suggestionOptionsAsText(container)).toEqual([]);
    });

    it('should populate suggestions with the default presets and relative offsets on focus', async () => {
        const container = renderReminderEditorWrapper();
        const reminderInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'reminder');

        await fireEvent.focus(reminderInput);

        expect(suggestionOptionsAsText(container)).toEqual([
            '09:00 | 09:00',
            '12:00 | 12:00',
            '15:00 | 15:00',
            '18:00 | 18:00',
            'in 30 minutes | In 30 minutes (10:30)',
            'in 1 hour | In 1 hour (11:00)',
            'in 2 hours | In 2 hours (12:00)',
            'in 4 hours | In 4 hours (14:00)',
        ]);
    });

    it('should reflect configured presets, offsets and rounding increment', async () => {
        updateSettings({
            reminderPresetTimes: ['07:30'],
            reminderRelativeOffsetsMinutes: [15],
            reminderRoundingIncrementMinutes: 15,
        });
        const container = renderReminderEditorWrapper();
        const reminderInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'reminder');

        await fireEvent.focus(reminderInput);

        expect(suggestionOptionsAsText(container)).toEqual(['07:30 | 07:30', 'in 15 minutes | In 15 minutes (10:15)']);
    });

    it('should fill and resolve the field when a preset suggestion value is entered', async () => {
        const container = renderReminderEditorWrapper();
        const reminderInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'reminder');

        await fireEvent.input(reminderInput, { target: { value: '12:00' } });

        testInputValue(container, 'reminder', '12:00');
        testInputValue(container, 'parsedReminderTimeFromEditor', '12:00');
        testInputValue(container, 'reminderTimeFromEditor', '12:00');
        testInputValue(container, 'isReminderTimeValidFromEditor', 'true');
    });

    it('should resolve a relative suggestion value to its current preview time', async () => {
        const container = renderReminderEditorWrapper();
        const reminderInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'reminder');

        await fireEvent.input(reminderInput, { target: { value: 'in 30 minutes' } });

        // Unlike the menu's rounded quick-pick, typed free text (even picked from the suggestion list,
        // which is indistinguishable from typing once entered) is resolved exactly, not rounded.
        testInputValue(container, 'reminder', 'in 30 minutes');
        testInputValue(container, 'parsedReminderTimeFromEditor', '10:30');
        testInputValue(container, 'reminderTimeFromEditor', 'in 30 minutes');
        testInputValue(container, 'isReminderTimeValidFromEditor', 'true');
    });

    it('should show an error message for an invalid typed value', async () => {
        const container = renderReminderEditorWrapper();
        const reminderInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'reminder');

        await fireEvent.input(reminderInput, { target: { value: 'blah' } });

        testInputValue(container, 'parsedReminderTimeFromEditor', '<i>invalid reminder time</i>');
        testInputValue(container, 'isReminderTimeValidFromEditor', 'false');
    });
});
