import { type RenderResult, render } from '@testing-library/svelte';
import ModalOptionsEditor from '../../src/ui/ModalOptionsEditor.svelte';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';

export function getAndCheckButton(result: RenderResult<ModalOptionsEditor>, buttonId: string): HTMLButtonElement {
    const submit = result.getByText(buttonId) as HTMLButtonElement;
    expect(submit).toBeTruthy();
    return submit;
}

export function checkAndClickApplyButton(result: RenderResult<ModalOptionsEditor>) {
    const apply = getAndCheckButton(result, 'Apply');
    apply.click();
}

export function checkAndClickCancelButton(result: RenderResult<ModalOptionsEditor>) {
    const cancel = getAndCheckButton(result, 'Cancel');
    cancel.click();
}

export function renderAndCheckModal(onSave: () => void = () => {}) {
    const result: RenderResult<ModalOptionsEditor> = render(ModalOptionsEditor, {
        onSave,
        onClose: () => {},
    });
    const { container } = result;
    expect(() => container).toBeTruthy();
    return { result, container };
}

export function verifyModalHTML() {
    const { container } = renderAndCheckModal();

    const prettyHTML = prettifyHTML(container.innerHTML);
    verifyWithFileExtension(prettyHTML, 'html');
}
