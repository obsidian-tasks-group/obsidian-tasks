import { type CachedMetadata, type FrontMatterCache, getAllTags, parseFrontMatterTags } from 'obsidian';

/**
 * A simple class to provide access to file information via 'task.file' in scripting code.
 */
export class TasksFile {
    private readonly _path: string;
    private readonly _cachedMetadata: CachedMetadata;
    private readonly _frontmatter: FrontMatterCache = {} as FrontMatterCache;

    constructor(path: string, cachedMetadata: CachedMetadata = {}) {
        this._path = path;
        this._cachedMetadata = cachedMetadata;

        const rawFrontmatter = cachedMetadata.frontmatter;
        if (rawFrontmatter !== undefined) {
            this._frontmatter = JSON.parse(JSON.stringify(rawFrontmatter));
            this._frontmatter.tags = parseFrontMatterTags(rawFrontmatter) ?? [];
        }
    }

    /**
     * Return the path to the file.
     */
    get path(): string {
        return this._path;
    }

    /**
     * Return all the tags in the file, both from frontmatter and the body of the file.
     *
     * - It adds the `#` prefix to tags in the frontmatter.
     * - It removes any duplicate tag values.
     * - For now, it includes any global filter that is a tag, if there are any tasks in the file
     *   that have the global filter. This decision will be reviewed later.
     *
     * @todo Review presence of global filter tag in the results.
     */
    get tags(): string[] {
        // TODO Replace this with storing the sanitised tags, to avoid repeated re-calculation.
        const tags = getAllTags(this.cachedMetadata) ?? [];
        return [...new Set(tags)];
    }

    /**
     * Return Obsidian's [CachedMetadata](https://docs.obsidian.md/Reference/TypeScript+API/CachedMetadata)
     * for this file, if available.
     *
     * Any raw frontmatter may be accessed via `cachedMetadata.frontmatter`.
     * See [FrontMatterCache](https://docs.obsidian.md/Reference/TypeScript+API/FrontMatterCache).
     * But prefer using {@link frontmatter} where possible.
     *
     * @note This is currently only populated for Task objects when read in the Obsidian plugin.
     *       It's not populated for queries in the plugin, nor in most unit tests.
     *       If not available, it returns an empty object, {}.
     *
     * @see frontmatter, which provides a cleaned-up version of the raw frontmatter.
     */
    public get cachedMetadata(): CachedMetadata {
        return this._cachedMetadata;
    }

    /**
     * Returns a cleaned-up version of the frontmatter.
     *
     * If accessing tags, please note:
     * - If there are any tags in the frontmatter, `frontmatter.tags` will have the values with '#' prefix added.
     * - It recognises both `frontmatter.tags` and `frontmatter.tag` (and various capitalisation combinations too).
     * - It removes any null tags.
     *
     * @note This is currently only populated for Task objects when read in the Obsidian plugin.
     *       It's not populated for queries in the plugin, nor in most unit tests.
     *       And it is an empty object, {}, if the {@link cachedMetadata} has not been populated
     *       or if the markdown file has no frontmatter or empty frontmatter.
     */
    public get frontmatter(): FrontMatterCache {
        return this._frontmatter;
    }

    /**
     * Return the path to the file, with the filename extension removed.
     */
    get pathWithoutExtension(): string {
        return this.withoutExtension(this.path);
    }

    private withoutExtension(value: string) {
        return value.replace(/\.md$/, '');
    }

    /**
     * Return the root to the file.
     */
    get root(): string {
        let path = this.path.replace(/\\/g, '/');

        if (path.charAt(0) === '/') {
            path = path.substring(1);
        }

        const separatorIndex = path.indexOf('/');
        if (separatorIndex == -1) {
            return '/';
        }
        return path.substring(0, separatorIndex + 1);
    }

    get folder(): string {
        const path = this.path;
        const fileNameWithExtension = this.filename;
        const folder = path.substring(0, path.lastIndexOf(fileNameWithExtension));
        if (folder === '') {
            return '/';
        }
        return folder;
    }

    /**
     * Return the filename including the extension.
     */
    get filename(): string {
        // Copied from Task.filename and FilenameField.value() initially
        const fileNameMatch = this.path.match(/([^/]+)$/);
        if (fileNameMatch !== null) {
            return fileNameMatch[1];
        } else {
            return '';
        }
    }

    get filenameWithoutExtension(): string {
        return this.withoutExtension(this.filename);
    }
}
