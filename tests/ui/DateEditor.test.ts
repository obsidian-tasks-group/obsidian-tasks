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

describe('date editor wrapper tests', () => {
    it('should replace an empty date field with typed date value', async () => {
        const { container } = renderDateEditorWrapper();
        const dueDateInput = getAndCheckRenderedElement<HTMLInputElement>(container, 'due');
        const dueDateFromDateEditorInput = getAndCheckRenderedElement<HTMLInputElement>(
            container,
            'dueDateFromDateEditor',
        );

        expect(dueDateInput.value).toEqual('');
        expect(dueDateFromDateEditorInput.value).toEqual('');

        await fireEvent.input(dueDateInput, { target: { value: '2024-10-01' } });

        expect(dueDateInput.value).toEqual('2024-10-01');
        expect(dueDateFromDateEditorInput.value).toEqual('2024-10-01');
    });
});
