export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    dueDateMarker: string;
    doneDateMarker: string;
    recurrenceMarker: string;
    scheduledDateMarker: string;
}

export const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    dueDateMarker: '📅',
    doneDateMarker: '✅',
    recurrenceMarker: '🔁',
    scheduledDateMarker: '⏰',
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};
