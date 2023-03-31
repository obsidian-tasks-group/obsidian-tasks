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

    static equals(tag: string): boolean {
        return GlobalFilter.get() === tag;
    }

    static includedIn(description: string): boolean {
        const globalFilter = GlobalFilter.get();
        return description.includes(globalFilter);
    }

    static prependTo(description: string): string {
        return GlobalFilter.get() + ' ' + description;
    }

    /**
     * Search for the global filter for the purpose of removing it from the description, but do so only
     * if it is a separate word (preceding the beginning of line or a space and followed by the end of line
     * or a space), because we don't want to cut-off nested tags like #task/subtag.
     * If the global filter exists as part of a nested tag, we keep it untouched.
     */
    static removeAsWordFrom(description: string): string {
        if (GlobalFilter.isEmpty()) {
            return description;
        }

        // This matches the global filter (after escaping it) only when it's a complete word
        const theRegExp = RegExp('(^|\\s)' + RegExpTools.escapeRegExp(GlobalFilter.get()) + '($|\\s)', 'ug');

        if (description.search(theRegExp) > -1) {
            description = description.replace(theRegExp, '$1$2').replace('  ', ' ').trim();
        }

        return description;
    }

    static removeAsSubstringFrom(description: string): string {
        const globalFilter = GlobalFilter.get();
        return description.replace(globalFilter, '').trim();
    }

    static removeAsSubstringFromDependingOnSettings(description: string): string {
        const { removeGlobalFilter } = getSettings();
        if (removeGlobalFilter) {
            return GlobalFilter.removeAsSubstringFrom(description);
        }
        return description;
    }
}
