import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import { SettingsTab } from '../../src/Config/SettingsTab';

function serializeForApproval(value: unknown): unknown {
    if (value instanceof DocumentFragment) {
        const div = document.createElement('div');
        div.appendChild(value.cloneNode(true));
        return div.innerHTML;
    }

    if (Array.isArray(value)) {
        return value.map((item) => serializeForApproval(item));
    }

    if (typeof value === 'function') {
        return '[Function]';
    }

    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, entryValue]) => [key, serializeForApproval(entryValue)]),
        );
    }

    return value;
}

describe('SettingsTab post-1.13', () => {
    const plugin = {
        app: {} as any,
        manifest: { version: 'test-version' },
        saveSettings: jest.fn(async () => {}),
        getTasks: jest.fn(() => []),
    } as any;

    const events = {
        triggerReloadVault: jest.fn(),
        triggerReloadOpenSearchResults: jest.fn(),
    } as any;

    const settingsTab = new SettingsTab({ plugin, events });

    it('all settings', () => {
        verifyAsJson(serializeForApproval(settingsTab.getSettingDefinitions()));
    });
});
