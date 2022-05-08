export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    appendGlobalFilter: boolean;
    setDoneDate: boolean;
}

const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    appendGlobalFilter: false,
    setDoneDate: true,
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};
