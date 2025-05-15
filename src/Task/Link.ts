import type { LinkCache } from 'obsidian';

export class Link {
    private rawLink: LinkCache;
    private filename: string;
    constructor(rawLink: LinkCache, filename: string) {
        this.rawLink = rawLink;
        this.filename = filename;
    }

    public get originalMarkdown() {
        return this.rawLink.original;
    }

    public get destination() {
        return this.rawLink.link;
    }

    public get destinationFilename() {
        // If destination begins with a `#`, it is a internal heading link or an internal block link.
        if (this.destination.startsWith('#')) {
            return this.filename;
        }

        // Split the destination by `#` and return the first part.
        return this.destination.split('#')[0].split('/').pop();
    }

    public get displayText() {
        return this.rawLink.displayText;
    }
}
