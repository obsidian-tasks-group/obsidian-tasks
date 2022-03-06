export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    reminder: boolean; //To activate the reminder input
}

const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    reminder: false,
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};
