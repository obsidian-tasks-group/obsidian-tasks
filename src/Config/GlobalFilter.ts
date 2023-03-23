import { getSettings, updateSettings } from './Settings';

export class GlobalFilter {
    static empty = '';

    static get(): string {
        const { globalFilter } = getSettings();
        return globalFilter;
    }

    static set(value: string) {
        updateSettings({ globalFilter: value });
    }

    static reset() {
        updateSettings({ globalFilter: GlobalFilter.empty });
    }

    static isEmpty(): boolean {
        return GlobalFilter.get() === GlobalFilter.empty;
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
