import type { LinkCache } from 'obsidian';

export class Link {
    private readonly rawLink: LinkCache;
    private readonly filenameContainingLink: string;

    /**
     * @param {LinkCache} rawLink - The raw link from Obsidian cache.
     * @param {string} filenameContainingLink - The name of the file where this link is located.
     */
    constructor(rawLink: LinkCache, filenameContainingLink: string) {
        this.rawLink = rawLink;
        this.filenameContainingLink = filenameContainingLink;
    }

    public get originalMarkdown(): string {
        return this.rawLink.original;
    }

    public get destination(): string {
        return this.rawLink.link;
    }

    /**
     * Returns the filename of the link destination without the path or alias
     * Removes the .md extension if present leaves other extensions intact.
     * No accommodation for empty links.
     * @returns {string}
     */
    public get destinationFilename(): string {
        // Handle internal links (starting with '#')
        if (this.destination.startsWith('#')) {
            return this.filenameContainingLink;
        }

        // Extract filename from path (handles both path and optional hash fragment)
        const pathPart = this.destination.split('#', 1)[0];
        const destFilename = pathPart.substring(pathPart.lastIndexOf('/') + 1);

        // Remove.md extension if present
        return destFilename.endsWith('.md') ? destFilename.slice(0, -3) : destFilename;
    }

    public get displayText(): string | undefined {
        return this.rawLink.displayText;
    }
}
