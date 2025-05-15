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
        // Limitation: # in filename can never be supported
        // Remove the path from the destination first to handle # in path
        // TODO: Is the performance hit worth handling # in path?
        // ai says 30% slower over 1000000 iterations 320ms vs 450ms compared to last commit
        const filenamePart = this.destination.substring(this.destination.lastIndexOf('/') + 1);

        // Handle internal links (starting with '#')
        if (this.destination[0] === '#') return this.filename;

        // Removes # after path is removed
        return filenamePart.split('#', 1)[0];
    }

    public get displayText() {
        return this.rawLink.displayText;
    }
}
