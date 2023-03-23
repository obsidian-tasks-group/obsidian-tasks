import * as RegExpTools from '../lib/RegExpTools';
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

    static includes(searchIn: string): boolean {
        const globalFilter = GlobalFilter.get();
        return searchIn.includes(globalFilter);
    }

    static removeAsWordFrom(aString: string): string {
        if (GlobalFilter.isEmpty()) {
            return aString;
        }

        // This matches the global filter (after escaping it) only when it's a complete word
        const theRegExp = RegExp('(^|\\s)' + RegExpTools.escapeRegExp(GlobalFilter.get()) + '($|\\s)', 'ug');

        if (aString.search(theRegExp) > -1) {
            aString = aString.replace(theRegExp, '$1$2').replace('  ', ' ').trim();
        }

        return aString;
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
