import { render } from '@testing-library/svelte';
import ModalOptionsEditor from '../../src/ui/ModalOptionsEditor.svelte';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';

export function getAndCheckButton(
    result: { getByText: (text: string) => HTMLElement },
    buttonId: string,
): HTMLButtonElement {
    const submit = result.getByText(buttonId) as HTMLButtonElement;
    expect(submit).toBeTruthy();
    return submit;
}

export function checkAndClickApplyButton(result: { getByText: (text: string) => HTMLElement }) {
    const apply = getAndCheckButton(result, 'Apply');
    apply.click();
}

export function checkAndClickCancelButton(result: { getByText: (text: string) => HTMLElement }) {
    const cancel = getAndCheckButton(result, 'Cancel');
    cancel.click();
}

export function renderAndCheckModal(onSave: () => void = () => {}) {
    const result = render(ModalOptionsEditor, {
        onSave,
        onClose: () => {},
    });
    const { container } = result;
    expect(() => container).toBeTruthy();
    return { result, container };
}

export async function verifyModalHTML() {
    const { container } = renderAndCheckModal();

    const prettyHTML = await prettifyHTML(container.innerHTML);
    verifyWithFileExtension(prettyHTML, 'html');
}
