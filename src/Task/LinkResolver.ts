import type { App, Reference } from 'obsidian';

export type GetFirstLinkpathDestFn = (rawLink: Reference, sourcePath: string) => string | null;

const defaultGetFirstLinkpathDestFn = (_rawLink: Reference, _sourcePath: string) => null;

/**
 * An abstraction to implement {@link Link.destinationPath}.
 *
 * See also:
 * - `src/main.ts` - search for `LinkResolver.getInstance()`
 * - Uses of {@link getFirstLinkpathDest} and {@link getFirstLinkpathDestFromData} in
 * `tests/__mocks__/obsidian.ts`.
 */
export class LinkResolver {
    private static instance: LinkResolver;

    private getFirstLinkpathDestFn: GetFirstLinkpathDestFn = defaultGetFirstLinkpathDestFn;
    private _app: App | null = null;

    public setGetFirstLinkpathDestFn(getFirstLinkpathDestFn: GetFirstLinkpathDestFn) {
        this.getFirstLinkpathDestFn = getFirstLinkpathDestFn;
    }

    public resetGetFirstLinkpathDestFn() {
        this.getFirstLinkpathDestFn = defaultGetFirstLinkpathDestFn;
    }

    public getDestinationPath(rawLink: Reference, pathContainingLink: string) {
        return this.getFirstLinkpathDestFn(rawLink, pathContainingLink) ?? undefined;
    }

    public get app(): App | null {
        return this._app;
    }

    public setApp(value: App | null) {
        this._app = value;
    }

    /**
     * Provides access to the single global instance of the LinkResolver.
     * This should be used in the plugin code.
     */
    public static getInstance(): LinkResolver {
        if (!LinkResolver.instance) {
            LinkResolver.instance = new LinkResolver();
        }

        return LinkResolver.instance;
    }
}
