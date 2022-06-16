import { Feature, FeatureFlag } from './Feature';

export interface Settings {
    // Original settings, they will be auto migrated to the new settings map.
    globalFilter: string;
    removeGlobalFilter: boolean;
    setDoneDate: boolean;

    // Collection of feature flag IDs and their state.
    features: FeatureFlag;

    // Settings are moved to a more general map to allow the settings UI to be
    // dynamically generated.
    generalSettings: SettingsMap;

    // Tracks the stage of the headings in the setttings UI.
    headingOpened: HeadingState;
}

interface SettingsMap {
    [key: string]: string | boolean;
}

type HeadingState = {
    [id: string]: boolean;
};

const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    setDoneDate: true,
    features: Feature.settingsFlags,
    generalSettings: {
        globalFilter: '',
        removeGlobalFilter: false,
        setDoneDate: true,
        // Allows the filter to be pushed to the end of the tag. Available if APPEND_GLOBAL_FILTER feature enabled.
        appendGlobalFilter: false,
    },
    headingOpened: {}, //;  { 'Documentation and Support': true },
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    // Check to see if there is a new flag and if so add it to the users settings.
    for (const flag in Feature.settingsFlags) {
        if (settings.features[flag] === undefined) {
            settings.features[flag] = Feature.settingsFlags[flag];
        }
    }

    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};

export const updateGeneralSetting = (
    name: string,
    value: string | boolean,
): Settings => {
    settings.generalSettings[name] = value;

    // sync the old settings for the moment so a larger change is not needed.
    updateSettings({
        globalFilter: <string>settings.generalSettings['globalFilter'],
    });
    updateSettings({
        removeGlobalFilter: <boolean>(
            settings.generalSettings['removeGlobalFilter']
        ),
    });
    updateSettings({
        setDoneDate: <boolean>settings.generalSettings['setDoneDate'],
    });

    return getSettings();
};

export const getGeneralSetting = (name: string): string | boolean => {
    return settings.generalSettings[name];
};

export const isFeatureEnabled = (internalName: string): boolean => {
    return settings.features[internalName] ?? false;
};

export const toggleFeature = (
    internalName: string,
    enabled: boolean,
): FeatureFlag => {
    settings.features[internalName] = enabled;
    return settings.features;
};
