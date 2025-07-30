import type { Reference } from 'obsidian';
import { Link } from './Link';

export class LinkResolver {
    private static instance: LinkResolver;

    public resolve(rawLink: Reference, pathContainingLink: string) {
        return new Link(rawLink, pathContainingLink);
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
