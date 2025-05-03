import type { LinkCache } from 'obsidian';

export class Link {
    private rawLink: LinkCache;
    constructor(rawLink: LinkCache) {
        this.rawLink = rawLink;
    }

    public get originalMarkdown() {
        return this.rawLink.original;
    }

    public get destination() {
        return this.rawLink.link;
    }

    public get displayText() {
        return this.rawLink.displayText;
    }
}
