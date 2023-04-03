import { makeDefaultSuggestionBuilder } from '../Suggestor/Suggestor';
import { DEFAULT_SYMBOLS } from '../TaskSerializer/DefaultTaskSerializer';
import { StatusConfiguration } from '../StatusConfiguration';
import { Status } from '../Status';
import { DefaultTaskSerializer, type TaskSerializer } from '../TaskSerializer';
import type { SuggestionBuilder } from '../Suggestor';
import { DebugSettings } from './DebugSettings';
import { StatusSettings } from './StatusSettings';
import { Feature } from './Feature';
import type { FeatureFlag } from './Feature';
import { GlobalFilter } from './GlobalFilter';

interface SettingsMap {
    [key: string]: string | boolean;
}

export type HeadingState = {
    [id: string]: boolean;
};

/**
 * Interface encapsulating how a Task is written to and read from text
 *
 */
interface TaskFormat {
    /** User facing name of the {@link TaskFormat} */
    displayName: string;
    /** {@link TaskSerializer} responsible for reading Tasks from text and writing them back into text */
    taskSerializer: TaskSerializer;
    /** Function that generates Intellisense-like suggestions as a user is typing a Task */
    buildSuggestions?: SuggestionBuilder;
}

/** Map of all defined {@link TaskFormat}s */
export const TASK_FORMATS = {
    tasksPluginEmoji: {
        displayName: 'Default',
        taskSerializer: new DefaultTaskSerializer(DEFAULT_SYMBOLS),
        buildSuggestions: makeDefaultSuggestionBuilder(DEFAULT_SYMBOLS),
    },
} as const;

export type TASK_FORMATS = typeof TASK_FORMATS; // For convenience to make some typing easier

export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    taskFormat: keyof TASK_FORMATS;
    setCreatedDate: boolean;
    setDoneDate: boolean;
    autoSuggestInEditor: boolean;
    autoSuggestMinMatch: number;
    autoSuggestMaxItems: number;
    provideAccessKeys: boolean;
    useFilenameAsScheduledDate: boolean;
    filenameAsDateFolders: string[];

    // The custom status states.
    statusSettings: StatusSettings;

    // Collection of feature flag IDs and their state.
    features: FeatureFlag;

    // Settings are moved to a more general map to allow the settings UI to be
    // dynamically generated.
    generalSettings: SettingsMap;

    // Tracks the stage of the headings in the settings UI.
    headingOpened: HeadingState;
    debugSettings: DebugSettings;
}

const defaultSettings: Settings = {
    globalFilter: GlobalFilter.empty,
    removeGlobalFilter: false,
    taskFormat: 'tasksPluginEmoji',
    setCreatedDate: false,
    setDoneDate: true,
    autoSuggestInEditor: true,
    autoSuggestMinMatch: 0,
    autoSuggestMaxItems: 6,
    provideAccessKeys: true,
    useFilenameAsScheduledDate: false,
    filenameAsDateFolders: [],
    statusSettings: new StatusSettings(),
    features: Feature.settingsFlags,
    generalSettings: {
        /* Prevent duplicate values in user settings for now,
           at least until I start porting the pre-1.23.0 settings
           code to be generated from settingsConfiguration.json.
         */
        // globalFilter: '',
        // removeGlobalFilter: false,
        // setDoneDate: true,
    },
    headingOpened: {},
    debugSettings: new DebugSettings(),
};

let settings: Settings = { ...defaultSettings };

/**
 * Returns the current settings as a object, it will also check and
 * update the flags to make sure they are all shown in the data.json
 * file. Exposure via the settings UI is optional.
 *
 * @export
 * @returns true if the feature is enabled.
 */
export const getSettings = (): Settings => {
    // Check to see if there is a new flag and if so add it to the users settings.
    for (const flag in Feature.settingsFlags) {
        if (settings.features[flag] === undefined) {
            settings.features[flag] = Feature.settingsFlags[flag];
        }
    }

    // In case saves pre-dated StatusConfiguration.type
    // TODO Special case for symbol 'X' or 'x' (just in case)
    settings.statusSettings.customStatuses.forEach((s, index, array) => {
        const newType = Status.getTypeFromStatusTypeString(s.type);
        array[index] = new StatusConfiguration(
            s.symbol ?? ' ',
            s.name,
            s.nextStatusSymbol ?? 'x',
            s.availableAsCommand,
            newType,
        );
    });

    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};

export const resetSettings = (): Settings => {
    return updateSettings(defaultSettings);
};

export const updateGeneralSetting = (name: string, value: string | boolean): Settings => {
    settings.generalSettings[name] = value;

    /* Prevent duplicate values in user settings for now,
       at least until I start porting the pre-1.23.0 settings
       code to be generated from settingsConfiguration.json.
     */
    // sync the old settings for the moment so a larger change is not needed.
    // updateSettings({
    //     globalFilter: <string>settings.generalSettings['globalFilter'],
    //     removeGlobalFilter: <boolean>settings.generalSettings['removeGlobalFilter'],
    //     setDoneDate: <boolean>settings.generalSettings['setDoneDate'],
    // });

    return getSettings();
};

/**
 * Returns the enabled state of the feature from settings.
 *
 * @export
 * @param internalName the internal name of the feature.
 * @returns true if the feature is enabled.
 */
export const isFeatureEnabled = (internalName: string): boolean => {
    return settings.features[internalName] ?? false;
};

/**
 * enables toggling the feature and returning the current collection with state.
 *
 * @export
 * @param internalName the internal name of the feature.
 * @param enabled the expected state of the feature.
 * @returns the features with the specified feature toggled.
 */
export const toggleFeature = (internalName: string, enabled: boolean): FeatureFlag => {
    settings.features[internalName] = enabled;
    return settings.features;
};

/**
 * Retrieves the {@link TaskFormat} that corresponds to user's selection ({@link Settings.taskFormat})
 *
 * @exports
 * @returns {TaskFormat}
 */
export function getUserSelectedTaskFormat(): TaskFormat {
    return TASK_FORMATS[getSettings().taskFormat];
}
