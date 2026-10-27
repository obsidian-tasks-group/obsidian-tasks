import { verifyAsJson } from '@approval-tests/approvals/lib/Providers/Vitest/VitestApprovals';
import { MarkdownView, lastModalState, resetLastModalState } from '../__mocks__/obsidian';

import { SettingsTab } from '../../src/Config/SettingsTab';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { getSettings, resetSettings } from '../../src/Config/Settings';
import { i18n } from '../../src/i18n/i18n';

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
    saveSettings: vi.fn(async () => {}),
    getTasks: vi.fn(() => []),
} as any;

const events = {
    triggerReloadVault: vi.fn(),
    triggerReloadOpenSearchResults: vi.fn(),
} as any;

describe('SettingsTab post-1.13', () => {
    const settingsTab = new SettingsTab({ plugin, events });

    it('all settings', () => {
        // TODO Show the 'Global Query' modal
        // TODO Show the 'Enable custom searches' modal.
        // TODO Show options in the 'Task count location' dropdown.
        verifyAsJson(serializeForApproval(settingsTab.getSettingDefinitions()));
    });
});

describe('SettingsTab applies changed settings without reloading', () => {
    const readingView = Object.assign(new MarkdownView(), { previewMode: { rerender: vi.fn() } });
    const pluginWithWorkspace = {
        ...plugin,
        app: { workspace: { getLeavesOfType: vi.fn(() => [{ view: readingView }]) } },
    } as any;

    afterEach(() => {
        resetSettings();
        GlobalFilter.getInstance().reset();
        vi.clearAllMocks();
    });

    function findSetting(items: unknown, name: string): any {
        if (Array.isArray(items)) {
            for (const item of items) {
                const found = findSetting(item, name);
                if (found) return found;
            }
        } else if (items !== null && typeof items === 'object') {
            const record = items as Record<string, unknown>;
            if (record.name === name) return record;
            for (const value of Object.values(record)) {
                const found = findSetting(value, name);
                if (found) return found;
            }
        }
        return undefined;
    }

    /**
     * Render a setting with a minimal fake Setting, and return its toggle's onChange handler
     * and the buttons it added.
     */
    function renderToggleSetting(name: string) {
        const settingsTab = new SettingsTab({ plugin: pluginWithWorkspace, events });
        const definition = findSetting(settingsTab.getSettingDefinitions(), name);
        let onChange: (value: boolean) => Promise<void> = async () => {};
        const buttons: unknown[] = [];
        const fakeSetting = {
            controlEl: { prepend: () => {} },
            addToggle(callback: (toggle: any) => void) {
                const toggle = {
                    setValue: () => toggle,
                    onChange: (handler: typeof onChange) => {
                        onChange = handler;
                        return toggle;
                    },
                };
                callback(toggle);
                return fakeSetting;
            },
            addButton(callback: (button: any) => void) {
                const button: any = {
                    buttonEl: { toggle: () => {} },
                    setButtonText: () => button,
                    setCta: () => button,
                    onClick: () => button,
                };
                buttons.push(button);
                callback(button);
                return fakeSetting;
            },
        };
        definition.render(fakeSetting);
        return { onChange: (value: boolean) => onChange(value), buttons };
    }

    it.fails('should redraw tasks, not offer a reload, when "Remove global filter" changes', async () => {
        const { onChange, buttons } = renderToggleSetting(i18n.t('settings.globalFilter.removeFilter.name'));

        await onChange(true);

        expect(getSettings().removeGlobalFilter).toEqual(true);
        expect(GlobalFilter.getInstance().getRemoveGlobalFilter()).toEqual(true);
        expect(buttons).toHaveLength(0);
        expect(events.triggerReloadOpenSearchResults).toHaveBeenCalled();
        expect(readingView.previewMode.rerender).toHaveBeenCalledWith(true);
    });
});
