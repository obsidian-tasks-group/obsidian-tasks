import type { Reference } from 'obsidian';
import { Link } from './Link';

export type GetFirstLinkpathDestFn = (linkpath: string, sourcePath: string) => string | null;

export class LinkResolver {
    private static instance: LinkResolver;

    private getFirstLinkpathDestFn: GetFirstLinkpathDestFn = (_linkpath: string, _sourcePath: string) => null;

    public setGetFirstLinkpathDestFn(getFirstLinkpathDestFn: GetFirstLinkpathDestFn) {
        this.getFirstLinkpathDestFn = getFirstLinkpathDestFn;
    }

    public resolve(rawLink: Reference, pathContainingLink: string) {
        return new Link(
            rawLink,
            pathContainingLink,
            this.getFirstLinkpathDestFn(rawLink.link, pathContainingLink) ?? undefined,
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
