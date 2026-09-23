import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import {
    lastModalState,
    recordedLegacySettings,
    resetLastModalState,
    resetRecordedLegacySettings,
} from '../__mocks__/obsidian';

import { SettingsTab } from '../../src/Config/SettingsTab';

// Convert the declarative settings tree into approval-friendly JSON.
// This preserves visible text/HTML and replaces callbacks with stable markers.

// The promoted keys will be saved first, in that order.
// All other keys will be sorted alphabetically.
const promotedKeys = ['name', 'heading', 'desc'] as const;
const promotedKeySet = new Set<string>(promotedKeys);

function compareApprovalKeys(a: string, b: string): number {
    const aPromoted = promotedKeySet.has(a);
    const bPromoted = promotedKeySet.has(b);

    if (aPromoted && bPromoted) {
        return (
            promotedKeys.indexOf(a as (typeof promotedKeys)[number]) -
            promotedKeys.indexOf(b as (typeof promotedKeys)[number])
        );
    }

    if (aPromoted) {
        return -1;
    }

    if (bPromoted) {
        return 1;
    }

    return a.localeCompare(b);
}

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
        const record = Object.fromEntries(
            Object.entries(value)
                .sort(([a], [b]) => compareApprovalKeys(a, b))
                .map(([key, entryValue]) => {
                    // Extra buttons can hide user-visible modal text behind onClick handlers,
                    // so capture a little more than just "[Function]" for these.
                    if (key === 'extraButtons' && Array.isArray(entryValue)) {
                        return [
                            key,
                            entryValue.map((buttonFactory) => serializeExtraButton(buttonFactory as Function)),
                        ];
                    }
                    return [key, serializeForApproval(entryValue)];
                }),
        );
        return record;
    }

    return value;
}

// Some extraButtons open modals from their onClick handlers.
// Give the factory a fake button, then run the captured click callback
// so approval tests can see the modal title and body text.
function serializeExtraButton(buttonFactory: Function): unknown {
    resetLastModalState();

    let onClickCallback: (() => void) | undefined;

    const buttonRecord: Record<string, unknown> = {};

    const fakeButton = {
        setIcon(icon: string) {
            buttonRecord.icon = icon;
            return this;
        },
        setTooltip(tooltip: string) {
            buttonRecord.tooltip = tooltip;
            return this;
        },
        onClick(callback: () => void) {
            onClickCallback = callback;
            buttonRecord.onClick = '[Function]';
            return this;
        },
    };

    buttonFactory(fakeButton);

    if (onClickCallback) {
        onClickCallback();

        if (lastModalState.opened) {
            buttonRecord.modal = {
                title: lastModalState.title,
                html: lastModalState.html,
            };
        }
    }

    return buttonRecord;
}

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

describe('SettingsTab post-1.13', () => {
    const settingsTab = new SettingsTab({ plugin, events });

    it('all settings', () => {
        verifyAsJson(serializeForApproval(settingsTab.getSettingDefinitions()));
    });
});

describe('SettingsTab pre-1.13', () => {
    const settingsTab = new SettingsTab({ plugin, events });

    it('all settings', () => {
        resetRecordedLegacySettings();
        resetLastModalState();

        settingsTab.display();

        verifyAsJson(recordedLegacySettings);
    });
});
