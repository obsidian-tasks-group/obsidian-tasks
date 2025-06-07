import {
    DEFAULT_MAX_GENERIC_SUGGESTIONS,
    makeDefaultSuggestionBuilder,
    onlySuggestIfBracketOpen,
} from '../Suggestor/Suggestor';
import { DEFAULT_SYMBOLS } from '../TaskSerializer/DefaultTaskSerializer';
import { DATAVIEW_SYMBOLS } from '../TaskSerializer/DataviewTaskSerializer';
import { StatusConfiguration } from '../Statuses/StatusConfiguration';
import { Status } from '../Statuses/Status';
import { DefaultTaskSerializer, type TaskSerializer } from '../TaskSerializer';
import type { SuggestionBuilder } from '../Suggestor';
import type { LogOptions } from '../lib/logging';
import { DataviewTaskSerializer } from '../TaskSerializer/DataviewTaskSerializer';
import { i18n } from '../i18n/i18n';
import { DebugSettings } from './DebugSettings';
import { StatusSettings } from './StatusSettings';
import { Feature } from './Feature';
import type { FeatureFlag } from './Feature';

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
    /** Function that returns the user facing name of the {@link TaskFormat} */
    getDisplayName: () => string;
    /** {@link TaskSerializer} responsible for reading Tasks from text and writing them back into text */
    taskSerializer: TaskSerializer;
    /** Function that generates Intellisense-like suggestions as a user is typing a Task */
    buildSuggestions?: SuggestionBuilder;
}

/** Map of all defined {@link TaskFormat}s */
export const TASK_FORMATS = {
    tasksPluginEmoji: {
        getDisplayName: () => i18n.t('settings.format.displayName.tasksEmojiFormat'),
        taskSerializer: new DefaultTaskSerializer(DEFAULT_SYMBOLS),
        buildSuggestions: makeDefaultSuggestionBuilder(DEFAULT_SYMBOLS, DEFAULT_MAX_GENERIC_SUGGESTIONS, false),
    },
    dataview: {
        getDisplayName: () => i18n.t('settings.format.displayName.dataview'),
        taskSerializer: new DataviewTaskSerializer(),
        buildSuggestions: onlySuggestIfBracketOpen(
            makeDefaultSuggestionBuilder(DATAVIEW_SYMBOLS, DEFAULT_MAX_GENERIC_SUGGESTIONS, true),
            [
                ['(', ')'],
                ['[', ']'],
            ],
        ),
    },
} as const;

export type TASK_FORMATS = typeof TASK_FORMATS; // For convenience to make some typing easier
export type PresetsMap = Record<string, string>;

export interface Settings {
    presets: PresetsMap;
    globalQuery: string;
    globalFilter: string;
    viSettings: boolean;
    username: string;
    password: string;
    removeGlobalFilter: boolean;
    taskFormat: keyof TASK_FORMATS;
    setCreatedDate: boolean;
    setDoneDate: boolean;
    setCancelledDate: boolean;
    autoSuggestInEditor: boolean;
    autoSuggestMinMatch: number;
    autoSuggestMaxItems: number;
    provideAccessKeys: boolean;
    useFilenameAsScheduledDate: boolean;
    filenameAsScheduledDateFormat: string;
    filenameAsDateFolders: string[];
    recurrenceOnNextLine: boolean;
    removeScheduledDateOnRecurrence: boolean;

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

    loggingOptions: LogOptions;
}

const defaultSettings: Readonly<Settings> = {
    presets: {},
    globalQuery: '',
    globalFilter: '',
    viSettings: true,
    username: '',
    password: '',
    removeGlobalFilter: false,
    taskFormat: 'tasksPluginEmoji',
    setCreatedDate: false,
    setDoneDate: true,
    setCancelledDate: true,
    autoSuggestInEditor: true,
    autoSuggestMinMatch: 0,
    autoSuggestMaxItems: 20,
    provideAccessKeys: true,
    useFilenameAsScheduledDate: false,
    filenameAsScheduledDateFormat: '',
    filenameAsDateFolders: [],
    recurrenceOnNextLine: false,
    removeScheduledDateOnRecurrence: false,
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

    /*
    `loggingOptions` is a property in the `Settings` interface that defines the logging options for
    the application. It is an object that contains a `minLevels` property, which is a map of logger
    names to their minimum logging levels. This allows the application to control the amount of
    logging output based on the logger name and the minimum logging level. For example, the logger
    name `tasks` might have a minimum logging level of `debug`, while the root logger might have a
    minimum logging level of `info`.
    */
    loggingOptions: {
        minLevels: {
            '': 'info',
            tasks: 'info',
            'tasks.Cache': 'info', // Cache.ts
            'tasks.Events': 'info', // TasksEvents.ts
            'tasks.File': 'info', // File.ts
            'tasks.Query': 'info', // Query.ts & QueryRenderer.ts
            'tasks.Task': 'info', // Task.ts
        },
    },
};

let settings: Settings = { ...defaultSettings };

function addNewOptionsToUserSettings<KeysAndValues>(defaultValues: KeysAndValues, userValues: KeysAndValues) {
    for (const flag in defaultValues) {
        if (userValues[flag] === undefined) {
            userValues[flag] = defaultValues[flag];
        }
    }
}

/**
 * Returns the current settings as a object, it will also check and
 * update the flags to make sure they are all shown in the data.json
 * file. Exposure via the settings UI is optional.
 *
 * @returns true if the feature is enabled.
 */
export const getSettings = (): Settings => {
    // Check to see if there are any new options that need to be added to the user's settings.
    addNewOptionsToUserSettings(Feature.settingsFlags, settings.features);
    addNewOptionsToUserSettings(defaultSettings.loggingOptions.minLevels, settings.loggingOptions.minLevels);
    addNewOptionsToUserSettings(defaultSettings.debugSettings, settings.debugSettings);

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
    // Apply migrations before updating settings
    const migratedSettings = migrateSettings(newSettings);

    settings = { ...settings, ...migratedSettings };

    return getSettings();
};

export const resetSettings = (): Settings => {
    settings = JSON.parse(JSON.stringify(defaultSettings));
    return settings;
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
 * @param internalName the internal name of the feature.
 * @returns true if the feature is enabled.
 */
export const isFeatureEnabled = (internalName: string): boolean => {
    return settings.features[internalName] ?? false;
};

/**
 * enables toggling the feature and returning the current collection with state.
 *
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
 * @returns {TaskFormat}
 */
export function getUserSelectedTaskFormat(): TaskFormat {
    return TASK_FORMATS[getSettings().taskFormat];
}

/**
 * Migrates old settings structure to new structure.
 * This handles backwards compatibility when settings property names change.
 *
 * Note: The vault's 'data.json' file is only updated when the user opens the Tasks settings UI.
 */
function migrateSettings(loadedSettings: any): Partial<Settings> {
    const migratedSettings = { ...loadedSettings };

    // Migrate 'includes' to 'presets' if present
    if ('includes' in migratedSettings && !('presets' in migratedSettings)) {
        migratedSettings.presets = migratedSettings.includes;
        delete migratedSettings.includes;
    }

    // Add future migrations here as needed

    return migratedSettings;
}
