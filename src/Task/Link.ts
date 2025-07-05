import type { Reference } from 'obsidian';

export class Link {
    private readonly rawLink: Reference;
    private readonly filenameContainingLink: string;
    private readonly pathContainingLink: string;

    /**
     * @param {Reference} rawLink - The raw link from Obsidian cache.
     * @param {string} filenameContainingLink - The name of the file where this link is located.
     * @param {string} pathContainingLink - The path of the file where this link is located.
     */
    constructor(rawLink: Reference, filenameContainingLink: string, pathContainingLink: string) {
        this.rawLink = rawLink;
        this.filenameContainingLink = filenameContainingLink;
        this.pathContainingLink = pathContainingLink;
    }

    /**
     * Return the original Markdown.
     *
     * See also {@link markdown}
     */
    public get originalMarkdown(): string {
        return this.rawLink.original;
    }

    /**
     * This is like {@link originalMarkdown}, but will also work for heading-only links
     * when viewed in files other than the one containing the original link.
     *
     * See also {@link originalMarkdown}
     */
    public get markdown(): string {
        if (!this.destination.startsWith('#')) {
            // The link already has a file name, so just return it
            return this.originalMarkdown;
        }

        // We will need to construct a new link, containing the filename (later, the full path)
        return `[[${this.pathContainingLink}${this.destination}|${this.displayText}]]`;
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
