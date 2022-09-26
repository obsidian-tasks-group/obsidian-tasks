import type { TagCache } from 'obsidian';

/**
 * Return the tags recognised by Obsidian on a single line of a Markdown file.
 *
 * This uses the tags obtained from a file's `CachedMetadata`
 *
 * @example
 *     const fileCache = this.metadataCache.getFileCache(file);
 *     const tagsInFile = fileCache.tags;
 *     const tagsOnLine = getTagsOnLine(tagsInFile, lineNumber);
 *
 * @param tagCache
 * @param lineNumber
 */
export function getTagsOnLine(tagCache: TagCache[] | undefined, lineNumber: number) {
    if (!tagCache) {
        return [];
    }
    return tagCache.filter((t) => t.position.start.line === lineNumber).map((t) => t.tag);
}

/**
 * Return all the tags recognised by Obsidian in a Markdown file, sorted alphabetically.
 * Duplicate tags are retained.
 *
 * @param tagCache
 */
export function getAllTagsInFileSorted(tagCache: TagCache[] | undefined) {
    if (!tagCache) {
        return [];
    }
    return tagCache.map((t) => t.tag).sort();
}

/**
 * Return the unique tags recognised by Obsidian in a Markdown file, sorted alphabetically.
 * Duplicate tags are discarded.
 *
 * @param tagsInFile - the result of calling {@link getAllTagsInFileSorted}
 */
export function getUniqueTagsInFileSorted(tagsInFile: string[]) {
    return Array.from(new Set(tagsInFile));
}
