import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import { i18n } from '../../src/i18n/i18n';
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
    it('renders the task format description as two paragraphs in order', () => {
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

        const definitions = settingsTab.getSettingDefinitions();
        const globalDefaultsGroup = definitions[0] as any;
        const taskFormatSetting = globalDefaultsGroup.items[0];

        const html = fragmentToHtml(taskFormatSetting.desc as DocumentFragment);

        expect(html).toBe(
            `<p>${i18n.t('settings.format.description.line1')}</p>` +
                `<p>${i18n.t('settings.format.description.line2')}</p>`,
        );
    });

    it('all settings', () => {
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

        verifyAsJson(serializeForApproval(settingsTab.getSettingDefinitions()));
    });
});

function fragmentToHtml(fragment: DocumentFragment): string {
    const div = document.createElement('div');
    div.appendChild(fragment.cloneNode(true));
    return div.innerHTML;
}
