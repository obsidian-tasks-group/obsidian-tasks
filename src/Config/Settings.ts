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
import { type PresetsMap, defaultPresets } from '../Query/Presets/Presets';
import { DebugSettings } from './DebugSettings';
import { type EditModalShowSettings, defaultEditModalShowSettings } from './EditModalShowSettings';
import { StatusSettings } from './StatusSettings';
import type { DismissedNotices } from './DismissibleNotices';

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

export type QuickSearchSettings = {
    fuzzyMatching: boolean;
};

export const POSTPONE_DATE_FIELD_VALUES: PostponeDateField[] = [
    'dueDate-scheduledDate-startDate',
    'scheduledDate-dueDate-startDate',
    'startDate-scheduledDate-dueDate',
    'dueDate',
    'scheduledDate',
    'startDate',
];

export type PostponeDateField =
    | 'dueDate-scheduledDate-startDate'
    | 'scheduledDate-dueDate-startDate'
    | 'startDate-scheduledDate-dueDate'
    | 'dueDate'
    | 'scheduledDate'
    | 'startDate';

export type PostponeSettings = {
    dateField: PostponeDateField;
};

export interface Settings {
    presets: PresetsMap;
    globalQuery: string;
    globalFilter: string;
    removeGlobalFilter: boolean;
    taskFormat: keyof TASK_FORMATS;
    setCreatedDate: boolean;
    setDoneDate: boolean;
    setCancelledDate: boolean;
    postpone: PostponeSettings;
    autoSuggestInEditor: boolean;
    autoSuggestMinMatch: number;
    autoSuggestMaxItems: number;
    provideAccessKeys: boolean;
    useFilenameAsScheduledDate: boolean;
    filenameAsScheduledDateFormat: string;
    filenameAsDateFolders: string[];
    recurrenceOnNextLine: boolean;
    removeScheduledDateOnRecurrence: boolean;
    searchResults: {
        taskCountLocation: 'top' | 'bottom';
    };
    quickSearch: QuickSearchSettings;

    // The custom status states.
    statusSettings: StatusSettings;

    // Edit modal field render settings.
    isShownInEditModal: EditModalShowSettings;

    // Notices that the user has chosen not to see again.
    // Keys are stable notice IDs.
    dismissedNotices: DismissedNotices;

    debugSettings: DebugSettings;

    loggingOptions: LogOptions;
}

const defaultSettings: Readonly<Settings> = {
    presets: defaultPresets,
    globalQuery: '',
    globalFilter: '',
    removeGlobalFilter: false,
    taskFormat: 'tasksPluginEmoji',
    setCreatedDate: false,
    setDoneDate: true,
    setCancelledDate: true,
    postpone: {
        dateField: 'dueDate-scheduledDate-startDate',
    },
    autoSuggestInEditor: true,
    autoSuggestMinMatch: 0,
    autoSuggestMaxItems: 20,
    provideAccessKeys: true,
    useFilenameAsScheduledDate: false,
    filenameAsScheduledDateFormat: '',
    filenameAsDateFolders: [],
    recurrenceOnNextLine: false,
    removeScheduledDateOnRecurrence: false,
    searchResults: {
        taskCountLocation: 'bottom',
    },
    quickSearch: {
        fuzzyMatching: true,
    },
    statusSettings: new StatusSettings(),
    isShownInEditModal: defaultEditModalShowSettings,
    dismissedNotices: {
        // Note: if any new options are added here, there will need to be a mechanism
        // to add the new values to pre-existing user settings.
        'live-preview-callout-warning': false,
    },

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
    settings = JSON.parse(JSON.stringify(defaultSettings)) as Settings;
    return settings;
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
function migrateSettings(loadedSettings: Record<string, unknown>): Partial<Settings> {
    const migratedSettings: Record<string, unknown> = { ...loadedSettings };

    // Migrate 'includes' to 'presets' if present
    if ('includes' in migratedSettings && !('presets' in migratedSettings)) {
        migratedSettings.presets = migratedSettings.includes;
        delete migratedSettings.includes;
    }

    // Remove the obsolete default 'features' setting from older data.json files.
    // (The only reason that the value would differ from our old default is if
    // the code is running in a Fork of Tasks, whose author decided to use the Features facility.
    // This is highly unlikely, but a precaution worth taking.)
    const oldDefaultFeatures = { INTERNAL_TESTING_ENABLED_BY_DEFAULT: true };
    if (JSON.stringify(migratedSettings.features) === JSON.stringify(oldDefaultFeatures)) {
        delete migratedSettings.features;
    }

    const oldDefaultGeneralSettings = {};
    if (JSON.stringify(migratedSettings.generalSettings) === JSON.stringify(oldDefaultGeneralSettings)) {
        delete migratedSettings.generalSettings;
    }

    // Add future migrations here as needed

    return migratedSettings;
}
