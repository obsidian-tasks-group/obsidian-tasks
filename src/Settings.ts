export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    dueDateRegex: string;
    scheduledDateRegex: string;
}

export const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    dueDateRegex: '[📅📆🗓] ?(\\d{4}-\\d{2}-\\d{2})',
    scheduledDateRegex: '[⏰⏲️🕰️] ?(\\d{4}-\\d{2}-\\d{2})',
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};
