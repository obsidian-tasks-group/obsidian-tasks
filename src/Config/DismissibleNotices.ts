export type DismissibleNoticeId = 'live-preview-callout-warning';

export type DismissedNotices = Partial<Record<DismissibleNoticeId, boolean>>;

export interface SettingsSaver {
    saveSettings(): Promise<void>;
}
