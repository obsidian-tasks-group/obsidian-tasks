export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    appendGlobalFilter: boolean;
}

const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    appendGlobalFilter: false,
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};
