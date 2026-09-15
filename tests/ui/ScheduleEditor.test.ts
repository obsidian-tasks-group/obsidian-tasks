/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/svelte';
import moment from 'moment/moment';
import ScheduleEditor from '../../src/ui/ScheduleEditor.svelte';
import { TASK_FORMATS } from '../../src/Config/Settings';
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

function suggestionOptionsAsText(container: HTMLElement): string[] {
    const datalist = getAndCheckRenderedElement<HTMLDataListElement>(container, 'schedule-suggestions');
    return Array.from(datalist.options).map((option) => `${option.value} | ${option.text}`);
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

    it('should always start with a blank text field, even when the task already has both a scheduled date and a reminder', () => {
        // The pickers already show the real values, and re-typing is only needed to change something -
        // pre-filling the text field with the existing 'date at time' text was tried and reverted.
        const container = render(ScheduleEditorWrapper, {
            initialScheduledDate: '2026-09-15',
            initialReminderTime: '15:17',
        }).container;

        expect(value(container, 'schedule')).toEqual('');
        expect(value(container, 'isScheduleValidFromEditor')).toEqual('true');
        expect(getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-date-picker').value).toEqual(
            '2026-09-15',
        );
        expect(getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-time-picker').value).toEqual(
            '15:17',
        );
    });

    it('should start valid even when the underlying scheduled date is itself unparseable, since the blank text has nothing to flag', () => {
        const container = render(ScheduleEditorWrapper, { initialScheduledDate: 'Invalid date' }).container;
        expect(value(container, 'schedule')).toEqual('');
        expect(value(container, 'isScheduleValidFromEditor')).toEqual('true');
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

    it('should revert reminderTime to its previous value (not stay stuck) when a later keystroke removes the just-typed explicit time', async () => {
        // Regression: typing 'in a month at 9' resolves reminderTime to '09:00' live, keystroke by
        // keystroke. Backspacing the '9' back off must revert reminderTime to whatever it was BEFORE this
        // typing sequence started (here: nothing) - not leave it stuck at the last resolved '09:00', which
        // a plain "leave reminderTime as it currently is" reading of "no explicit time in this parse" would
        // have done.
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.input(input, { target: { value: 'in a month at 9' } });
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');

        await fireEvent.input(input, { target: { value: 'in a month at ' } });
        expect(value(container, 'reminderTimeFromEditor')).toEqual('');
        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-12-27');
    });

    it('should revert reminderTime to the ORIGINAL reminder (not the empty/stuck intermediate) once a typed override is removed', async () => {
        const container = render(ScheduleEditorWrapper, {
            initialScheduledDate: '2024-11-27',
            initialReminderTime: '14:00',
            originalScheduledDate: moment('2024-11-27'),
        }).container;
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.input(input, { target: { value: 'in a month at 9' } });
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');

        await fireEvent.input(input, { target: { value: 'in a month' } });
        // Reverts to the task's original 14:00 - not '09:00' (stuck), and not '' either.
        expect(value(container, 'reminderTimeFromEditor')).toEqual('14:00');
    });

    it('should flag unparseable text as invalid', async () => {
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.input(input, { target: { value: 'wibble' } });

        expect(value(container, 'isScheduleValidFromEditor')).toEqual('false');
    });

    it('editing the date picker directly should leave reminderTime untouched, and keep it visible in the combined text', async () => {
        const container = render(ScheduleEditorWrapper, {}).container;
        const timePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-time-picker');
        await fireEvent.input(timePicker, { target: { value: '09:00' } });

        const datePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-date-picker');
        await fireEvent.input(datePicker, { target: { value: '2024-12-25' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-12-25');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
        expect(value(container, 'schedule')).toEqual('2024-12-25 at 09:00');
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

    it('editing the time picker directly should default the scheduled date to today when none is set yet, and update the combined text', async () => {
        const container = renderWrapper();
        const timePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-time-picker');

        await fireEvent.input(timePicker, { target: { value: '09:00' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-11-27');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
        expect(value(container, 'schedule')).toEqual('2024-11-27 at 09:00');
    });

    it('should show the orphaned-reminder warning immediately for a task that already has a reminder but no scheduled date', () => {
        // The realistic way this state now arises: a legacy task whose reminder pre-dates scheduled-date-
        // only anchoring (or one whose scheduled date was removed via the native date picker's own clear
        // control - see below) - not from merely emptying the text field, which now reverts to the
        // baseline rather than actually clearing anything (see the next few tests).
        const container = render(ScheduleEditorWrapper, { initialReminderTime: '09:00' }).container;

        expect(value(container, 'scheduledDateFromEditor')).toEqual('');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
        expect(container.textContent).toContain("won't fire");
    });

    it("should orphan the reminder when the scheduled date is cleared via the native date picker's own control", async () => {
        const container = render(ScheduleEditorWrapper, {
            initialScheduledDate: '2024-11-27',
            initialReminderTime: '09:00',
        }).container;

        const datePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-date-picker');
        await fireEvent.input(datePicker, { target: { value: '' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
        expect(container.textContent).toContain("won't fire");
    });

    it('typing a date then erasing all the typed text should revert to the original scheduled date, not clear it', async () => {
        // Regression: the text field starts blank even for a task that already has a scheduled date -
        // typing over it and then erasing everything must revert to what the task actually had, not wipe
        // it out just because the field is (once again) showing nothing.
        const container = render(ScheduleEditorWrapper, {
            originalScheduledDate: moment('2024-12-25'),
            initialScheduledDate: '2024-12-25',
        }).container;
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.input(input, { target: { value: 'tomorrow' } });
        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-11-28');

        await fireEvent.input(input, { target: { value: '' } });
        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-12-25');
        expect(value(container, 'isScheduleValidFromEditor')).toEqual('true');
    });

    it('typing a date then erasing all the typed text should not orphan an existing reminder either', async () => {
        const container = render(ScheduleEditorWrapper, {
            originalScheduledDate: moment('2024-12-25'),
            initialScheduledDate: '2024-12-25',
            initialReminderTime: '09:00',
        }).container;
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.input(input, { target: { value: 'tomorrow' } });
        await fireEvent.input(input, { target: { value: '' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-12-25');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('09:00');
        expect(container.textContent).not.toContain("won't fire");
    });

    it('the "Remove scheduled date" default button should clear scheduledDate, reminderTime, and the text field', async () => {
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');
        await fireEvent.input(input, { target: { value: 'tomorrow at 4pm' } });

        const button = Array.from(container.querySelectorAll('button')).find(
            (b) => b.textContent === 'Remove scheduled date',
        )!;
        await fireEvent.click(button);

        expect(value(container, 'scheduledDateFromEditor')).toEqual('');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('');
        expect(value(container, 'schedule')).toEqual('');
        expect(value(container, 'isScheduleValidFromEditor')).toEqual('true');
    });

    it('the "Remove reminder" default button should clear reminderTime and the text field, but keep scheduledDate', async () => {
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');
        await fireEvent.input(input, { target: { value: 'tomorrow at 4pm' } });

        const button = Array.from(container.querySelectorAll('button')).find(
            (b) => b.textContent === 'Remove reminder',
        )!;
        await fireEvent.click(button);

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2024-11-28');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('');
        expect(value(container, 'schedule')).toEqual('');
        expect(value(container, 'isScheduleValidFromEditor')).toEqual('true');
    });

    it('should populate suggestions with the relative offsets before the fixed presets, on focus', async () => {
        const container = renderWrapper();
        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');

        await fireEvent.focus(input);

        expect(suggestionOptionsAsText(container)).toEqual([
            // 'now' (10:00) is already exactly on a 30-minute mark, so the exact time remaining happens to
            // equal the nominal offset here - see ReminderSuggestions.test.ts for cases where they differ.
            'in 30 minutes | In 30 minutes (10:30)',
            'in 1 hour | In 1 hour (11:00)',
            'in 2 hours | In 2 hours (12:00)',
            'in 4 hours | In 4 hours (14:00)',
            '09:00 | 09:00',
            '12:00 | 12:00',
            '15:00 | 15:00',
            '18:00 | 18:00',
        ]);
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

    it('a bare time typed after a direct date-picker edit should anchor to the just-picked date, not the original one', async () => {
        // Same category of bug as reminderTime getting stuck (see above), for the date side: the "existing
        // scheduled date" a bare time falls back to must track deliberate picker edits made during this
        // same session, not stay frozen at whatever the task originally had when the dialog/modal opened.
        const container = render(ScheduleEditorWrapper, {
            originalScheduledDate: moment('2025-01-01'),
            initialScheduledDate: '2025-01-01',
        }).container;

        const datePicker = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule-editor-date-picker');
        await fireEvent.input(datePicker, { target: { value: '2025-06-01' } });

        const input = getAndCheckRenderedElement<HTMLInputElement>(container, 'schedule');
        await fireEvent.input(input, { target: { value: '16:00' } });

        expect(value(container, 'scheduledDateFromEditor')).toEqual('2025-06-01');
        expect(value(container, 'reminderTimeFromEditor')).toEqual('16:00');
    });
});

// ScheduleDialog.ts (a plain TS Modal, not a Svelte component) can't use `bind:` - it mounts ScheduleEditor
// imperatively via `new ScheduleEditor({ props: { onScheduledDateChange, onReminderTimeChange,
// onValidityChange, ... } })` instead, relying entirely on those three callback props to learn about
// changes. Every test above exercises the component only through ScheduleEditorWrapper.svelte's `bind:`,
// which never touches that callback-prop path at all - it was a real, separate bug (found via manual
// testing of the dialog, then confirmed here): a set of `$: onXChange?.(value)` reactive statements each
// fired exactly once, at mount, and never again after `value` was reassigned from inside a plain function
// (reparseScheduleText) rather than directly within the `$:` statement's own body. Fixed by having the one
// reactive block that already re-runs on every relevant change call the callbacks itself, instead of
// leaving them to re-derive their own (broken) dependency tracking - see that block's own comment.
describe('ScheduleEditor mounted via callback props only (ScheduleDialog.ts style, no bind:)', () => {
    function mountViaProps(props: {
        scheduledDate?: string;
        reminderTime?: string;
        originalScheduledDate?: moment.Moment | null;
    }) {
        const target = document.createElement('div');
        document.body.appendChild(target);

        const tracked = {
            scheduledDate: props.scheduledDate ?? '',
            reminderTime: props.reminderTime ?? '',
            isValid: true,
        };
        const { scheduledDateSymbol, reminderTimeSymbol } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

        new ScheduleEditor({
            target,
            props: {
                scheduledDate: tracked.scheduledDate,
                reminderTime: tracked.reminderTime,
                scheduledDateSymbol,
                reminderTimeSymbol,
                accesskey: null,
                originalScheduledDate: props.originalScheduledDate ?? null,
                onScheduledDateChange: (v: string) => {
                    tracked.scheduledDate = v;
                },
                onReminderTimeChange: (v: string) => {
                    tracked.reminderTime = v;
                },
                onValidityChange: (v: boolean) => {
                    tracked.isValid = v;
                },
            },
        });

        return { target, tracked };
    }

    it('should call back with the resolved values as the user types', async () => {
        const { target, tracked } = mountViaProps({});

        const input = target.querySelector('#schedule') as HTMLInputElement;
        await fireEvent.input(input, { target: { value: 'tomorrow at 4pm' } });

        expect(tracked.scheduledDate).toEqual('2024-11-28');
        expect(tracked.reminderTime).toEqual('16:00');
        expect(tracked.isValid).toEqual(true);
    });

    it('should call back with the new value when a picker is edited directly', async () => {
        const { target, tracked } = mountViaProps({});

        const timePicker = target.querySelector('#schedule-editor-time-picker') as HTMLInputElement;
        await fireEvent.input(timePicker, { target: { value: '18:45' } });

        expect(tracked.reminderTime).toEqual('18:45');
        expect(tracked.scheduledDate).toEqual('2024-11-27'); // defaulted to today
    });

    it('should call back with cleared values when a remove button is clicked', async () => {
        const { target, tracked } = mountViaProps({ scheduledDate: '2026-09-15', reminderTime: '15:17' });

        const button = Array.from(target.querySelectorAll('button')).find((b) => b.textContent === 'Remove reminder')!;
        await fireEvent.click(button);

        expect(tracked.reminderTime).toEqual('');
        expect(tracked.scheduledDate).toEqual('2026-09-15');
    });

    it('should call back with isValid=false for unparseable text', async () => {
        const { target, tracked } = mountViaProps({});

        const input = target.querySelector('#schedule') as HTMLInputElement;
        await fireEvent.input(input, { target: { value: 'wibble' } });

        expect(tracked.isValid).toEqual(false);
    });
});
