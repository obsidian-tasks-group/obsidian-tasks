import { getSettings, updateSettings } from './Settings';

export class GlobalFilter {
    static set(value: string) {
        updateSettings({ globalFilter: value });
    }

    static get(): string {
        const { globalFilter } = getSettings();
        return globalFilter;
    }

    static matches(searchIn: string): boolean {
        const globalFilter = GlobalFilter.get();
        return searchIn.includes(globalFilter);
    }

    static removeFrom(aString: string): string {
        const globalFilter = GlobalFilter.get();
        return aString.replace(globalFilter, '').trim();
    }

    static removeFromDependingOnSettings(aString: string): string {
        const { removeGlobalFilter } = getSettings();
        if (removeGlobalFilter) {
            return GlobalFilter.removeFrom(aString);
        }
        return aString;
    }
}
