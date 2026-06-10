import { Notice } from 'obsidian';
import { getSettings } from './Settings';

export type DismissibleNoticeId = 'live-preview-callout-warning';

export type DismissedNotices = Partial<Record<DismissibleNoticeId, boolean>>;

export interface SettingsSaver {
    saveSettings(): Promise<void>;
}

export function showDismissibleNotice(
    dontShowAgainKey: DismissibleNoticeId,
    msg: string,
    settingsSaver: SettingsSaver,
): void {
    if (getSettings().dismissedNotices[dontShowAgainKey]) {
        return;
    }

    const fragment = createFragment();

    const message = createDiv();
    message.textContent = msg;

    const label = createEl('label');
    label.addClass('tasks-dismissible-notice-checkbox-label');

    const checkbox = createEl('input');
    checkbox.type = 'checkbox';

    checkbox.addEventListener('change', () => {
        getSettings().dismissedNotices[dontShowAgainKey] = checkbox.checked;
        void settingsSaver.saveSettings();
    });

    label.appendChild(checkbox);
    label.appendText(' Do not show me this message again');

    fragment.appendChild(message);
    fragment.appendChild(label);

    console.warn(msg);
    new Notice(fragment, 45000);
}
