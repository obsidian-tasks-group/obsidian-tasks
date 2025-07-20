import type { Reference } from 'obsidian';
import type { TasksFile } from '../Scripting/TasksFile';

export class Link {
    private readonly rawLink: Reference;
    private readonly pathContainingLink: string;

    /**
     * @param {Reference} rawLink - The raw link from Obsidian cache.
     * @param {string} pathContainingLink - The path of the file where this link is located.
     */
    constructor(rawLink: Reference, pathContainingLink: string) {
        this.rawLink = rawLink;
        this.pathContainingLink = pathContainingLink;
    }

    /**
     * Return the original Markdown, exactly as specified in the original markdown.
     * For "[ab](cd.md)", it would return "[ab](cd.md)".
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
     * For "[ab](cd.md)" it would return "[ab](cd.md)".
     * For "[#heading](cd.md)" in file "de.md" it would return "[de#heading](cd.md)".
     *
     * This is needed if using links in Tasks group headings if any of your task files have
     * links to headings in their same file.
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

    /**
     * Return the destination, exactly as specified in the original markdown.
     * For "[ab](cd.md)", it would return "cd.md".
     *
     * It is not able to supply the full path of the link destination.
     * Note that if you have two files called `cd.md`, Tasks does not yet do anything
     * to select the closest file of that name.
     *
     * So if this is used in a link in Obsidian, Obsidian will use its own logic to open the
     * "closest" file.
     * Obsidian would choose the closest file to where the Tasks query is, as opposed
     * to the closest file where the original task Markdown line is.
     */
    public get destination(): string {
        return this.rawLink.link;
    }

    /**
     * For "[ab](cd.md)", it would return "ab".
     */
    public get displayText(): string | undefined {
        return this.rawLink.displayText;
    }

    public isLinkTo(destination: string | TasksFile): boolean {
        if (typeof destination === 'string') {
            const removeMd = /\.md$/;
            const thisDestinationWithoutMd = this.destination.replace(removeMd, '');
            const destinationWithoutMd = destination.replace(removeMd, '');

            // This is filenames match allowing extension to be present or absent
            if (destinationWithoutMd === thisDestinationWithoutMd) {
                return true;
            }

            // The link can contain a folder that is not present in the parameter
            if (thisDestinationWithoutMd.endsWith(`/${destinationWithoutMd}`)) {
                return true;
            }

            return false;
        }

        return this.isLinkTo(destination.path);
    }
}
