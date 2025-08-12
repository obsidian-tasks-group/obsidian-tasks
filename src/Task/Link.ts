import type { Reference } from 'obsidian';
import type { TasksFile } from '../Scripting/TasksFile';

export class Link {
    private readonly rawLink: Reference;
    private readonly pathContainingLink: string;
    private readonly _destinationPath: string | null;

    /**
     * @param {Reference} rawLink - The raw link from Obsidian cache.
     * @param {string} pathContainingLink - The path of the file where this link is located.
     * @param {string | undefined} destinationPath - The path of the note being linked tio.
     */
    constructor(rawLink: Reference, pathContainingLink: string, destinationPath?: string) {
        this.rawLink = rawLink;
        this.pathContainingLink = pathContainingLink;
        this._destinationPath = destinationPath ?? null;
    }

    /**
     * Return the original Markdown, exactly as specified in the original markdown.
     * For "[ab](cd.md)", it would return "[ab](cd.md)".
     *
     * **Tip**: For use in `group by function`, {@link markdown} will also work for header-only links,
     * like `[[#heading in this file]]`.
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
     * **Tip**: Use {@link destinationPath} instead.
     *
     * This method is not able to supply the full path of the link destination.
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
     * The actual full path that Obsidian would navigate to if the user clicked on the link,
     * or `null` if the link is to a non-existent file.
     *
     * For "[[link_in_file_body]]", it might return "Test Data/link_in_file_body.md".
     *
     * Note that this value is not usually configured correctly in tests.
     * See {@link LinkResolver} docs for more info.
     */
    public get destinationPath(): string | null {
        return this._destinationPath;
    }

    /**
     * For "[[Styling of Queries]]", it would return "Styling of Queries"
     * For "[[link_in_task_wikilink|alias]]", it would return "alias"
     * For "[ab](cd.md)", it would return "ab".
     * For "[[Project Search#Search 1]]", it would return "Project Search > Search 1"
     */
    public get displayText(): string | undefined {
        return this.rawLink.displayText;
    }

    /**
     * Returns true if this link points to the given value
     * - Pass in `query.file` or `task.file` for the most precise results.
     * - If supplying a string, it is case-sensitive, and it will return true if:
     *     - the string matches the link destination's filename (it ignores `.md` file extension)
     *     - or the string matches the link destination's full path (it ignores `.md` file extension)
     * @param destination
     */
    public linksTo(destination: string | TasksFile): boolean {
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

        // Links only match if they resolve to the full path,
        // thus distinguishing between multiple identically named files
        // in different folders in the vault.
        return this.destinationPath === destination.path;
    }
}
