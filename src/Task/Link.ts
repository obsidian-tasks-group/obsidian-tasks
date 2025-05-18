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

    /**
     * Returns the filename of the link destination without the path or alias
     * Removes the .md extension if present leaves other extensions intact.
     * No accomodation for empty links.
     * @returns {string}
     */
    public get destinationFilename() {
        // Handle internal links (starting with '#')
        if (this.destination[0] === '#') return this.filename;

        // Extract filename from path (handles both path and optional hash fragment)
        const pathPart = this.destination.split('#', 1)[0];
        const withoutDirectory = pathPart.substring(pathPart.lastIndexOf('/') + 1);

        // Remove.md extension if present
        return withoutDirectory.endsWith('.md') ? withoutDirectory.slice(0, -3) : withoutDirectory;
    }

    public get displayText() {
        return this.rawLink.displayText;
    }
}
