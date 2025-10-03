import type { CachedMetadata, Reference } from 'obsidian';

export type GetFirstLinkpathDestFn = (rawLink: Reference, sourcePath: string) => string | null;
export type GetFileCacheFn = (filePath: string) => CachedMetadata | null;

const defaultGetFirstLinkpathDestFn = (_rawLink: Reference, _sourcePath: string) => null;
const defaultGetFileCacheFn = (_filePath: string) => null;

/**
 * An abstraction to implement {@link Link.destinationPath} and help {@link Link} to create {@link TasksFile} objects.
 *
 * See also:
 * - For how this is configured in the **released plugin**:
 *      - `src/main.ts`
 * - For how this is configured in the **tests**:
 *      - `LinkResolver.setup.ts`
 */
export class LinkResolver {
    private static instance: LinkResolver;

    private getFirstLinkpathDestFn: GetFirstLinkpathDestFn = defaultGetFirstLinkpathDestFn;
    private getFileCacheFn: GetFileCacheFn = defaultGetFileCacheFn;

    public setGetFirstLinkpathDestFn(getFirstLinkpathDestFn: GetFirstLinkpathDestFn) {
        this.getFirstLinkpathDestFn = getFirstLinkpathDestFn;
    }

    public setGetFileCacheFn(getFileCacheFn: GetFileCacheFn) {
        this.getFileCacheFn = getFileCacheFn;
    }

    public getDestinationPath(rawLink: Reference, pathContainingLink: string) {
        return this.getFirstLinkpathDestFn(rawLink, pathContainingLink) ?? undefined;
    }

    public getFileCache(filePath: string): CachedMetadata | null {
        return this.getFileCacheFn(filePath);
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
