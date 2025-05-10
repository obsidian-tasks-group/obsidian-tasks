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
        // If destination begins with a `#`, it is a heading link. So return this.filename. Otherwise, return this.destination.
        return this.destination.startsWith('#') ? this.filename : this.destination;
    }

    public get displayText() {
        return this.rawLink.displayText;
    }
}
