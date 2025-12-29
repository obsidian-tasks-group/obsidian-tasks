import { type RenderResult, render } from '@testing-library/svelte';
import ModalOptionsEditor from '../../src/ui/ModalOptionsEditor.svelte';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';

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

describe('ModalOptionsEditor snapshot tests', () => {
    it('should match snapshot', () => {
        verifyModalHTML();
    });
});
