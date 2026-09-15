/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/svelte';
import moment from 'moment/moment';
import ScheduleEditorWrapper from './ScheduleEditorWrapper.svelte';
import { getAndCheckRenderedElement } from './RenderingTestHelpers';

window.moment = moment;

function renderWrapper(componentOptions: { forwardOnly?: boolean; originalScheduledDate?: moment.Moment | null } = {}) {
    const { container } = render(ScheduleEditorWrapper, componentOptions);
    expect(() => container).toBeTruthy();
    return container;
}

function value(container: HTMLElement, id: string): string {
    return getAndCheckRenderedElement<HTMLInputElement>(container, id).value;
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-11-27T10:00:00'));
});

afterEach(() => {
    jest.useRealTimers();
});

describe('ScheduleEditor', () => {
    it('should initialise as empty and valid, with no reminder', () => {
        const container = renderWrapper();

        expect(value(container, 'schedule')).toEqual('');
        expect(value(container, 'scheduledDateFromEditor')).toEqual('');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('');
        expect(value(container, 'isScheduleValidFromEditor')).toEqual('true');
        expect(getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-date-picker').value).toEqual(
            '',
        );
        expect(getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-time-picker').value).toEqual(
            '',
        );
    });

    it('should flag an already-invalid seed value as invalid immediately, without any typing', () => {
        // Regression check: the modal's Apply button must be disabled from the moment it opens if the
        // task's existing scheduled date text is unparseable - not only after the user next types something.
        const container = render(ScheduleEditorWrapper, { initialScheduledDate: 'Invalid date' }).container;
        expect(value(container, 'schedule')).toEqual('Invalid date');
        expect(value(container, 'isScheduleValidFromEditor')).toEqual('false');
    });

    it('a date-only phrase should resolve scheduledDate and leave reminderTime untouched', async () => {
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.input(input, { target: { value: 'tomorrow' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-11-28');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('');
        expect(value(container, 'isScheduleValidFromEditor')).toEqual('true');
    });

    it('a date-only phrase should leave a pre-existing reminderTime completely unchanged', async () => {
        const container = render(ScheduleEditorWrapper, {}).container;
        // Seed a reminder via the time picker first (see 'should set today as the scheduled date...' below).
        const timePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-time-picker');
        await fireEvent.input(timePicker, { target: { value: '09:00' } });
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');

        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');
        await fireEvent.input(input, { target: { value: 'in a week' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-12-04');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
    });

    it('a phrase with an explicit time should resolve both scheduledDate and reminderTime', async () => {
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.input(input, { target: { value: 'tomorrow at 4pm' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-11-28');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('16:00');
    });

    it('should flag unparseable text as invalid', async () => {
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.input(input, { target: { value: 'wibble' } });

        expect(value(container, 'isScheduleValidFromEditor')).toEqual('false');
    });

    it('editing the date picker directly should leave reminderTime untouched', async () => {
        const container = render(ScheduleEditorWrapper, {}).container;
        const timePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-time-picker');
        await fireEvent.input(timePicker, { target: { value: '09:00' } });

        const datePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-date-picker');
        await fireEvent.input(datePicker, { target: { value: '2024-12-25' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-12-25');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
    });

    it('editing the time picker directly should leave scheduledDate untouched when one is already set', async () => {
        const container = renderWrapper();
        const datePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-date-picker');
        await fireEvent.input(datePicker, { target: { value: '2024-12-25' } });

        const timePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-time-picker');
        await fireEvent.input(timePicker, { target: { value: '09:00' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-12-25');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
    });

    it('editing the time picker directly should default the scheduled date to today when none is set yet', async () => {
        const container = renderWrapper();
        const timePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-time-picker');

        await fireEvent.input(timePicker, { target: { value: '09:00' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-11-27');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
    });

    it('should show the orphaned-reminder warning when a reminder exists with no scheduled date', async () => {
        const container = renderWrapper();
        const timePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-time-picker');
        await fireEvent.input(timePicker, { target: { value: '09:00' } });

        // Emptying the text clears scheduledDate but never cascades to reminderTime (see decision #5).
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');
        await fireEvent.input(input, { target: { value: '' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
        expect(container.textContent).toContain("won't fire");
    });

    it('the "Remove scheduled date" default button should clear both scheduledDate and reminderTime', async () => {
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');
        await fireEvent.input(input, { target: { value: 'tomorrow at 4pm' } });

        const button = Array.from(container.querySelectorAll('button')).find(
            (b) => b.textContent === 'Remove scheduled date',
        )!;
        await fireEvent.click(button);

        expect(value(container, 'scheduledDateFromEditor')).toEqual('');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('');
    });

    it('the "Remove reminder" default button should clear only reminderTime', async () => {
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');
        await fireEvent.input(input, { target: { value: 'tomorrow at 4pm' } });

        const button = Array.from(container.querySelectorAll('button')).find(
            (b) => b.textContent === 'Remove reminder',
        )!;
        await fireEvent.click(button);

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-11-28');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('');
    });

    it('a bare time with an existing scheduled date should leave that date untouched', async () => {
        const container = render(ScheduleEditorWrapper, {
            originalScheduledDate: moment('2025-01-01'),
            initialScheduledDate: '2025-01-01',
        }).container;
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.input(input, { target: { value: '16:00' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2025-01-01');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('16:00');
    });
});
