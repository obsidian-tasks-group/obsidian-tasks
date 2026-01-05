import type { EditModalShowSettings } from '../../src/Config/EditModalShowSettings';
import { type Settings, getSettings, resetSettings, updateSettings } from '../../src/Config/Settings';
import {
    checkAndClickApplyButton,
    checkAndClickCancelButton,
    renderAndCheckModal,
    verifyModalHTML,
} from './ModalOptionsEditorTestHelpers';
import { optionsWithoutARandomField, uncheckCheckbox } from './RenderingTestHelpers';

afterEach(() => {
    resetSettings();
});

describe('ModalOptionsEditor snapshot tests', () => {
    it('should match snapshot', () => {
        verifyModalHTML();
    });

    it('should match snapshot - all options present even when a random option is absent', () => {
        updateSettings({ isShownInEditModal: optionsWithoutARandomField() });

        verifyModalHTML();
    });
});

describe('ModalOptionsEditor settings edit tests', () => {
    let savedSettings: Settings;
    beforeEach(() => {
        savedSettings = getSettings();
    });

    const saveSettings = () => (savedSettings = getSettings());

    const fields = Object.keys(getSettings().isShownInEditModal) as (keyof EditModalShowSettings)[];

    it.each(fields)('should set %s as hidden when Apply is clicked', async (field) => {
        const { result, container } = renderAndCheckModal(saveSettings);

        await uncheckCheckbox(container, field);
        // unchecking has not changed the global settings
        expect(getSettings().isShownInEditModal[field]).toEqual(true);

        checkAndClickApplyButton(result);
        // clicking the apply button actually saves the settings globally
        expect(getSettings().isShownInEditModal[field]).toEqual(false);
        // checking that the settings edit would be saved in data.json
        expect(savedSettings.isShownInEditModal[field]).toEqual(false);
    });

    it.each(fields)('should not save changes when Cancel is clicked', async (field) => {
        const { result, container } = renderAndCheckModal(saveSettings);

        await uncheckCheckbox(container, field);

        checkAndClickCancelButton(result);
        // clicking the cancel button has not saved the settings globally
        expect(getSettings().isShownInEditModal[field]).toEqual(true);
        // checking that the settings edit would not be saved in data.json
        expect(savedSettings.isShownInEditModal[field]).toEqual(true);
    });
});
