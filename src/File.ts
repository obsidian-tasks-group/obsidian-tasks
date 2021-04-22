import { ListItemCache, MetadataCache, TFile, Vault } from 'obsidian';

/**
 * Workaraound with static class until I find a better way to write tasks in files.
 */
export class File {
    private static metadataCache: MetadataCache | undefined;
    private static vault: Vault | undefined;

    public static initialize({
        metadataCache,
        vault,
    }: {
        metadataCache: MetadataCache;
        vault: Vault;
    }) {
        File.metadataCache = metadataCache;
        File.vault = vault;
    }

    public static async writeTask({
        path,
        taskSectionStart,
        taskSectionIndex,
        taskString,
    }: {
        path: string;
        taskSectionStart: number;
        taskSectionIndex: number;
        taskString: string;
    }): Promise<void> {
        if (File.vault === undefined || File.metadataCache === undefined) {
            console.error('Tasks: cannot use File before initializing it.');
            return;
        }

        const file = File.vault.getAbstractFileByPath(path);
        if (!(file instanceof TFile)) {
            return;
        }

        const fileCache = File.metadataCache.getFileCache(file);
        if (fileCache === null) {
            return;
        }

        const listItemsCache = fileCache.listItems;
        if (listItemsCache === undefined || listItemsCache.length === 0) {
            return;
        }

        let listItem: ListItemCache | undefined;
        let sectionIndex = 0;
        for (const listItemCache of listItemsCache) {
            if (listItemCache.position.start.line < taskSectionStart) {
                continue;
            }

            if (listItemCache.task === undefined) {
                continue;
            }

            if (sectionIndex === taskSectionIndex) {
                listItem = listItemCache;
            }

            sectionIndex++;
        }
        if (listItem === undefined) {
            return;
        }

        const fileContent = await File.vault.cachedRead(file);
        const fileLines = fileContent.split('\n');

        const updatedFileLines = [
            ...fileLines.slice(0, listItem.position.start.line),
            taskString,
            ...fileLines.slice(listItem.position.end.line + 1), // End has same zero-based index as start.
        ];

        await File.vault.modify(file, updatedFileLines.join('\n'));
    }
}
