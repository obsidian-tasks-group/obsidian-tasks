import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { GlobalQuery } from '../../src/Config/GlobalQuery';
import { applySettingsData, reloadSettingsFromDisk } from '../../src/Config/LoadSettings';
import { getSettings, resetSettings } from '../../src/Config/Settings';
import { StatusSettings } from '../../src/Config/StatusSettings';
import type { TasksEvents } from '../../src/Obsidian/TasksEvents';
import { StatusConfiguration, StatusType } from '../../src/Statuses/StatusConfiguration';
import { StatusRegistry } from '../../src/Statuses/StatusRegistry';

function makeEvents() {
    return {
        triggerReloadVault: vi.fn(),
        triggerReloadOpenSearchResults: vi.fn(),
    };
}

afterEach(() => {
    resetSettings();
    GlobalFilter.getInstance().reset();
    GlobalQuery.getInstance().reset();
    StatusRegistry.getInstance().resetToDefaultStatuses();
});

describe('applySettingsData', () => {
    it('should cope with no data.json', () => {
        applySettingsData(null);

        expect(getSettings().globalFilter).toEqual('');
    });

    // Each setting that some object keeps its own copy of.
    // If you add another such setting, add it here and to applySettingsData().
    it('should update the global filter', () => {
        applySettingsData({ globalFilter: '#task', removeGlobalFilter: true });

        expect(GlobalFilter.getInstance().get()).toEqual('#task');
        expect(GlobalFilter.getInstance().getRemoveGlobalFilter()).toEqual(true);
    });

    it('should update the global query', () => {
        applySettingsData({ globalQuery: 'not done' });

        expect(GlobalQuery.getInstance().query().source).toEqual('not done');
    });

    it('should update the status registry', () => {
        const statusSettings = new StatusSettings();
        StatusSettings.addStatus(
            statusSettings.customStatuses,
            new StatusConfiguration('!', 'Important', 'x', true, StatusType.TODO),
        );

        applySettingsData({ statusSettings });

        expect(StatusRegistry.getInstance().bySymbol('!').name).toEqual('Important');
    });
});

describe('reloadSettingsFromDisk', () => {
    it('should apply the new settings and refresh the vault and searches', async () => {
        const events = makeEvents();

        await reloadSettingsFromDisk(async () => ({ globalQuery: 'not done' }), events as unknown as TasksEvents);

        expect(GlobalQuery.getInstance().query().source).toEqual('not done');
        expect(events.triggerReloadVault).toHaveBeenCalledTimes(1);
        expect(events.triggerReloadOpenSearchResults).toHaveBeenCalledTimes(1);
    });

    it('should keep the current settings if data.json cannot be loaded', async () => {
        applySettingsData({ globalQuery: 'not done' });
        const events = makeEvents();

        await reloadSettingsFromDisk(
            async () => {
                throw new SyntaxError('Unexpected end of JSON input');
            },
            events as unknown as TasksEvents,
        );

        expect(GlobalQuery.getInstance().query().source).toEqual('not done');
        expect(events.triggerReloadVault).not.toHaveBeenCalled();
        expect(events.triggerReloadOpenSearchResults).not.toHaveBeenCalled();
    });
});
