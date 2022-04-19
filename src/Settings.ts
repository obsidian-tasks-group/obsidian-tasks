export const dateFormats = ['YYYY-MM-DD', 'YYYYMMDD'];
export type DateFormat = typeof dateFormats[number]; // All formats in the array of dateFormats.

export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    setDoneDate: boolean;
    dateFormat: DateFormat;
    linkDates: boolean;
}

const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    setDoneDate: true,
    dateFormat: 'YYYY-MM-DD',
    linkDates: false,
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};
