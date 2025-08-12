import type { Reference } from 'obsidian';
import { Link } from './Link';

export type GetFirstLinkpathDestFn = (rawLink: Reference, sourcePath: string) => string | null;

const defaultGetFirstLinkpathDestFn = (_rawLink: Reference, _sourcePath: string) => null;

/**
 * An abstraction to populate {@link Link.destinationPath}.
 *
 * See also:
 * - `src/main.ts` - search for `LinkResolver.getInstance()`
 * - Uses of {@link getFirstLinkpathDest} and {@link getFirstLinkpathDestFromData} in
 * `tests/__mocks__/obsidian.ts`.
 */
export class LinkResolver {
    private static instance: LinkResolver;

    private getFirstLinkpathDestFn: GetFirstLinkpathDestFn = defaultGetFirstLinkpathDestFn;

    public setGetFirstLinkpathDestFn(getFirstLinkpathDestFn: GetFirstLinkpathDestFn) {
        this.getFirstLinkpathDestFn = getFirstLinkpathDestFn;
    }

    public resetGetFirstLinkpathDestFn() {
        this.getFirstLinkpathDestFn = defaultGetFirstLinkpathDestFn;
    }

    public resolve(rawLink: Reference, pathContainingLink: string) {
        return new Link(
            rawLink,
            pathContainingLink,
            this.getFirstLinkpathDestFn(rawLink, pathContainingLink) ?? undefined,
        );
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
