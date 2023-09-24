import * as RegExpTools from '../lib/RegExpTools';

/**
 * GlobalFilter has its own data, independent of {@link Settings.globalFilter} value in {@link Settings}.
 *
 * See https://publish.obsidian.md/tasks/Getting+Started/Global+Filter
 *
 * Limitations:
 * - All methods are static, so it is a collection of multiple static things
 *     - This is in contrast to {@link GlobalQuery} what has just the one static method, {@link GlobalQuery.getInstance}.
 *     - These static methods will be made non-static in a future change.
 */
export class GlobalFilter {
    private static instance: GlobalFilter;

    static empty = '';
    private _globalFilter = '';
    private _removeGlobalFilter = false;

    /**
     * Provides access to the single global instance of GlobalFilter.
     * This should eventually only be used in the plugin code.
     */
    public static getInstance(): GlobalFilter {
        if (!GlobalFilter.instance) {
            GlobalFilter.instance = new GlobalFilter();
        }

        return GlobalFilter.instance;
    }

    public get(): string {
        return this._globalFilter;
    }

    public set(value: string) {
        this._globalFilter = value;
    }

    public reset() {
        this.set(GlobalFilter.empty);
    }

    public isEmpty(): boolean {
        return this.get() === GlobalFilter.empty;
    }

    public equals(tag: string): boolean {
        return this.get() === tag;
    }

    public includedIn(description: string): boolean {
        const globalFilter = this.get();
        return description.includes(globalFilter);
    }

    public prependTo(description: string): string {
        return this.get() + ' ' + description;
    }

    public removeAsWordFromDependingOnSettings(description: string): string {
        const removeGlobalFilter = this.getRemoveGlobalFilter();
        if (removeGlobalFilter) {
            return this.removeAsWordFrom(description);
        }

        return description;
    }

    /**
     * @see setRemoveGlobalFilter
     */
    public getRemoveGlobalFilter() {
        return this._removeGlobalFilter;
    }

    /**
     * @see getRemoveGlobalFilter
     */
    public setRemoveGlobalFilter(removeGlobalFilter: boolean) {
        this._removeGlobalFilter = removeGlobalFilter;
    }

    /**
     * Search for the global filter for the purpose of removing it from the description, but do so only
     * if it is a separate word (preceding the beginning of line or a space and followed by the end of line
     * or a space), because we don't want to cut-off nested tags like #task/subtag.
     * If the global filter exists as part of a nested tag, we keep it untouched.
     */
    public removeAsWordFrom(description: string): string {
        if (this.isEmpty()) {
            return description;
        }

        // This matches the global filter (after escaping it) only when it's a complete word
        const theRegExp = RegExp('(^|\\s)' + RegExpTools.escapeRegExp(this.get()) + '($|\\s)', 'ug');

        if (description.search(theRegExp) > -1) {
            description = description.replace(theRegExp, '$1$2').replace('  ', ' ').trim();
        }

        return description;
    }

    public removeAsSubstringFrom(description: string): string {
        const globalFilter = this.get();
        return description.replace(globalFilter, '').trim();
    }
}
