export interface Settings {
    globalFilter: string;
    removeGlobalFilter: boolean;
    setDoneDate: boolean;
    autoSuggestInEditor: boolean;
    autoSuggestMinMatch: number;
}

const defaultSettings: Settings = {
    globalFilter: '',
    removeGlobalFilter: false,
    setDoneDate: true,
    autoSuggestInEditor: true,
    autoSuggestMinMatch: 0,
};

let settings: Settings = { ...defaultSettings };

export const getSettings = (): Settings => {
    return { ...settings };
};

export const updateSettings = (newSettings: Partial<Settings>): Settings => {
    settings = { ...settings, ...newSettings };

    return getSettings();
};
