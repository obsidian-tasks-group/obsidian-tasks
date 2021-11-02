export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    setDoneDate: boolean;
    dateFormat: string;
    dateLink: boolean;
}

const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    setDoneDate: true,
    dateFormat: 'YYYY-MM-DD',
    dateLink: false,
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};
