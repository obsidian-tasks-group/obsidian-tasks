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
        // Handle internal links (starting with '#')
        if (this.destination[0] === '#') return this.filename;

        // Extract filename from path (handles both path and optional hash fragment)
        const pathPart = this.destination.split('#', 1)[0];
        const withoutPath = pathPart.substring(pathPart.lastIndexOf('/') + 1);

        // Remove.md extension if present
        const final = withoutPath.endsWith('.md') ? withoutPath.substring(0, withoutPath.length - 3) : withoutPath;

        return final;
    }

    public get displayText() {
        return this.rawLink.displayText;
    }
}
