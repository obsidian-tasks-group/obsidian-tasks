import type { LinkCache } from 'obsidian';

export class Link {
    private readonly rawLink: LinkCache;
    private readonly filename: string;

    /**
     * @param {LinkCache} rawLink - The raw link from Obsidian cache.
     * @param {string} filename - The name of the file where this link is located.
     */
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
     * No accommodation for empty links.
     * @returns {string}
     */
    public get destinationFilename() {
        // Handle internal links (starting with '#')
        if (this.destination.startsWith('#')) return this.filename;

        // Extract filename from path (handles both path and optional hash fragment)
        const pathPart = this.destination.split('#', 1)[0];
        const destFilename = pathPart.substring(pathPart.lastIndexOf('/') + 1);

        // Remove.md extension if present
        return destFilename.endsWith('.md') ? destFilename.slice(0, -3) : destFilename;
    }

    public get displayText() {
        return this.rawLink.displayText;
    }
}
