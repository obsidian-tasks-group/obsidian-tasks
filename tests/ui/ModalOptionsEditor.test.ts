import { fireEvent } from '@testing-library/svelte';
import { type EditModalShowSettings, editModalFieldGroups } from 'Config/EditModalShowSettings';
import { type Settings, getSettings, resetSettings, updateSettings } from 'Config/Settings';
import { settingsStore } from 'ui/SettingsStore';
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
    it('should match snapshot', async () => {
        await verifyModalHTML();
    });

    it('should match snapshot - all options present even when a random option is absent', async () => {
        updateSettings({ isShownInEditModal: optionsWithoutARandomField() });

        await verifyModalHTML();
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

describe('ModalOptionsEditor reordering tests', () => {
    // The modal reads the settings from settingsStore, which resetSettings() does not update.
    beforeEach(() => {
        settingsStore.set(getSettings());
    });

    function groupHandles(container: HTMLElement) {
        return Array.from(container.querySelectorAll('.tasks-options-modal-group > .tasks-options-modal-handle'));
    }

    function fieldHandle(container: HTMLElement, field: keyof EditModalShowSettings) {
        return container.querySelector(`#${field}`)!.closest('.tasks-options-modal-field')!.querySelector('button')!;
    }

    function renderedFields(container: HTMLElement) {
        return Array.from(container.querySelectorAll('input[type="checkbox"]')).map((input) => input.id);
    }

    it('should move a group down with the keyboard, and save the order when Apply is clicked', async () => {
        const { result, container } = renderAndCheckModal();

        await fireEvent.keyDown(groupHandles(container)[0], { key: 'ArrowDown' });

        const expectedOrder = [
            ['recurrence', 'due', 'scheduled', 'start'],
            ['priority'],
            ['before_this', 'after_this'],
            ['status', 'created', 'done', 'cancelled'],
        ];
        expect(renderedFields(container)).toEqual(expectedOrder.flat());
        expect(getSettings().editModalFieldOrder).toEqual(editModalFieldGroups);

        checkAndClickApplyButton(result);
        expect(getSettings().editModalFieldOrder).toEqual(expectedOrder);
    });

    it('should move a field up within its group with the keyboard', async () => {
        const { result, container } = renderAndCheckModal();

        await fireEvent.keyDown(fieldHandle(container, 'scheduled'), { key: 'ArrowUp' });
        checkAndClickApplyButton(result);

        expect(getSettings().editModalFieldOrder[1]).toEqual(['recurrence', 'scheduled', 'due', 'start']);
    });

    it('should not move the first field up, out of its group', async () => {
        const { container } = renderAndCheckModal();

        await fireEvent.keyDown(fieldHandle(container, 'status'), { key: 'ArrowUp' });

        expect(renderedFields(container)).toEqual(editModalFieldGroups.flat());
    });

    it('should not save the order when Cancel is clicked', async () => {
        const { result, container } = renderAndCheckModal();

        await fireEvent.keyDown(groupHandles(container)[0], { key: 'ArrowDown' });
        checkAndClickCancelButton(result);

        expect(getSettings().editModalFieldOrder).toEqual(editModalFieldGroups);
    });

    it('should keep field order changes local when Cancel is clicked', async () => {
        const { result, container } = renderAndCheckModal();

        await fireEvent.keyDown(fieldHandle(container, 'scheduled'), { key: 'ArrowUp' });
        expect(getSettings().editModalFieldOrder).toEqual(editModalFieldGroups);
        checkAndClickCancelButton(result);

        expect(getSettings().editModalFieldOrder).toEqual(editModalFieldGroups);
    });

    it('should reset the order when Reset order is clicked', async () => {
        settingsStore.set({
            ...getSettings(),
            editModalFieldOrder: editModalFieldGroups.map((group) => [...group]).reverse(),
        });
        const { result, container } = renderAndCheckModal();

        await fireEvent.click(result.getByText('Reset order'));

        expect(renderedFields(container)).toEqual(editModalFieldGroups.flat());
    });
});
