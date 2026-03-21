/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/svelte';
import DurationEditorWrapper from './DurationEditorWrapper.svelte';
import { getAndCheckRenderedElement } from './RenderingTestHelpers';

function renderDurationEditorWrapper(componentOptions: { initialDuration?: string } = {}) {
    const { container } = render(DurationEditorWrapper, componentOptions);
    expect(container).toBeTruthy();
    return container;
}

function getDurationInput(container: HTMLElement): HTMLInputElement {
    return getAndCheckRenderedElement<HTMLInputElement>(container, 'duration');
}

function getParsedDurationElement(container: HTMLElement): HTMLElement {
    const code = container.querySelector('code.tasks-modal-parsed-date') as HTMLElement;
    expect(code).not.toBeNull();
    return code;
}

function getIsDurationValidInput(container: HTMLElement): HTMLInputElement {
    return getAndCheckRenderedElement<HTMLInputElement>(container, 'isDurationValidFromDurationEditor');
}

async function typeIntoDurationInput(container: HTMLElement, value: string) {
    const durationInput = getDurationInput(container);
    await fireEvent.input(durationInput, { target: { value } });
}

describe('DurationEditor component', () => {
    it('should show no duration for empty input', () => {
        const container = renderDurationEditorWrapper();

        const codeElement = getParsedDurationElement(container);
        expect(codeElement.innerHTML).toContain('<i>no duration</i>');

        const durationInput = getDurationInput(container);
        expect(durationInput.classList.contains('tasks-modal-error')).toBe(false);

        const isValidInput = getIsDurationValidInput(container);
        expect(isValidInput.value).toEqual('true');
    });

    it('should show parsed duration for valid input', async () => {
        const container = renderDurationEditorWrapper();

        await typeIntoDurationInput(container, '1h30m');

        const codeElement = getParsedDurationElement(container);
        expect(codeElement.innerHTML).toContain('1h30m');

        const durationInput = getDurationInput(container);
        expect(durationInput.classList.contains('tasks-modal-error')).toBe(false);

        const isValidInput = getIsDurationValidInput(container);
        expect(isValidInput.value).toEqual('true');
    });

    it('should normalise 90m to 1h30m', async () => {
        const container = renderDurationEditorWrapper();

        await typeIntoDurationInput(container, '90m');

        const codeElement = getParsedDurationElement(container);
        expect(codeElement.innerHTML).toContain('1h30m');

        const isValidInput = getIsDurationValidInput(container);
        expect(isValidInput.value).toEqual('true');
    });

    it('should show error for invalid input', async () => {
        const container = renderDurationEditorWrapper();

        await typeIntoDurationInput(container, 'blah');

        const codeElement = getParsedDurationElement(container);
        expect(codeElement.innerHTML).toContain('invalid duration');

        const durationInput = getDurationInput(container);
        expect(durationInput.classList.contains('tasks-modal-error')).toBe(true);

        const isValidInput = getIsDurationValidInput(container);
        expect(isValidInput.value).toEqual('false');
    });

    it('should show 2h for hours-only input', async () => {
        const container = renderDurationEditorWrapper();

        await typeIntoDurationInput(container, '2h');

        const codeElement = getParsedDurationElement(container);
        expect(codeElement.innerHTML).toContain('2h');

        const isValidInput = getIsDurationValidInput(container);
        expect(isValidInput.value).toEqual('true');
    });

    it('should show 45m for minutes-only input', async () => {
        const container = renderDurationEditorWrapper();

        await typeIntoDurationInput(container, '45m');

        const codeElement = getParsedDurationElement(container);
        expect(codeElement.innerHTML).toContain('45m');

        const isValidInput = getIsDurationValidInput(container);
        expect(isValidInput.value).toEqual('true');
    });

    it('should display initial duration from editableTask', () => {
        const container = renderDurationEditorWrapper({ initialDuration: '1h' });

        const durationInput = getDurationInput(container);
        expect(durationInput.value).toEqual('1h');

        const codeElement = getParsedDurationElement(container);
        expect(codeElement.innerHTML).toContain('1h');
    });
});
