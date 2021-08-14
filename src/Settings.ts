export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    disableDateFormat: boolean,
    customDateFormat: string;
}

const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    disableDateFormat: true,
    customDateFormat: 'YYYY-MM-DD',
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};
