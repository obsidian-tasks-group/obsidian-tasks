import { type RenderResult, fireEvent, render } from '@testing-library/svelte';
import { getSettings, resetSettings } from '../../src/Config/Settings';
import ModalOptionsEditor from '../../src/ui/ModalOptionsEditor.svelte';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { getAndCheckRenderedElement } from './RenderingTestHelpers';

function renderAndCheckModal() {
    const result: RenderResult<ModalOptionsEditor> = render(ModalOptionsEditor, {
        onSave: () => {},
        onClose: () => {},
    });
    const { container } = result;
    expect(() => container).toBeTruthy();
    return { result, container };
}

function verifyModalHTML() {
    const { container } = renderAndCheckModal();

    const prettyHTML = prettifyHTML(container.innerHTML);
    verifyWithFileExtension(prettyHTML, 'html');
}

afterEach(() => {
    resetSettings();
});

describe('ModalOptionsEditor snapshot tests', () => {
    it('should match snapshot', () => {
        verifyModalHTML();
    });
});

describe('ModalOptionsEditor settings edit tests', () => {
    it('should set due as hidden', async () => {
        const { container } = renderAndCheckModal();

        const inputElement = getAndCheckRenderedElement<HTMLInputElement>(container, 'due');

        await fireEvent.change(inputElement, { target: { checked: false } });

        expect(getSettings().isShownInEditModal.due).toEqual(false);
    });
});
