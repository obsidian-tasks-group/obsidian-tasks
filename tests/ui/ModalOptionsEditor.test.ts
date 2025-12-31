import { type RenderResult, render } from '@testing-library/svelte';
import { getSettings, resetSettings } from '../../src/Config/Settings';
import ModalOptionsEditor from '../../src/ui/ModalOptionsEditor.svelte';
import { verifyWithFileExtension } from '../TestingTools/ApprovalTestHelpers';
import { prettifyHTML } from '../TestingTools/HTMLHelpers';
import { checkAndClickApplyButton, uncheckCheckbox } from './RenderingTestHelpers';

function renderAndCheckModal(onSave: () => void = () => {}) {
    const result: RenderResult<ModalOptionsEditor> = render(ModalOptionsEditor, {
        onSave,
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
    it('should set due as hidden when Apply is clicked', async () => {
        let savedSettings = getSettings();
        const saveSettings = () => (savedSettings = getSettings());
        const { result, container } = renderAndCheckModal(saveSettings);

        await uncheckCheckbox(container, 'due');
        // unchecking has not changed the global settings
        expect(getSettings().isShownInEditModal.due).toEqual(true);

        checkAndClickApplyButton(result);
        // clicking the apply button actually saves the settings globally
        expect(getSettings().isShownInEditModal.due).toEqual(false);
        // checking that the settings edit would be saved in data.json
        expect(savedSettings.isShownInEditModal.due).toEqual(false);
    });
});
