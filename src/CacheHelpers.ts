import type { TagCache } from 'obsidian';

export function getTagsOnLine(tagCache: TagCache[], lineNumber: number) {
    return tagCache.filter((t) => t.position.start.line === lineNumber).map((t) => t.tag);
}

export function getAllTagsInFileSorted(tagCache: TagCache[]) {
    return tagCache.map((t) => t.tag).sort();
}

export function getUniqueTagsInFileSorted(tagsInFile: string[]) {
    return Array.from(new Set(tagsInFile));
}
