import { i18n } from '../../src/i18n/i18n';
import { SettingsTab } from '../../src/Config/SettingsTab';

describe('SettingsTab declarative settings', () => {
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
});

function fragmentToHtml(fragment: DocumentFragment): string {
    const div = document.createElement('div');
    div.appendChild(fragment.cloneNode(true));
    return div.innerHTML;
}
