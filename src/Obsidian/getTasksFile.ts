import type { App, CachedMetadata } from 'obsidian';
import { TasksFile } from 'Scripting/TasksFile';

/**
 * Create a {@link TasksFile} for a path in the vault, including the file's cached metadata, if any.
 *
 * This is in its own module, rather than in `QueryRenderer`, so that the Tasks API can use it
 * without importing QueryRenderer, which would add a circular dependency via main.ts.
 *
 * @param app The Obsidian App.
 * @param filePath The path of the file in the vault. It does not need to exist.
 */
export function getTasksFile(app: App, filePath: string): TasksFile {
    const tFile = app.vault.getFileByPath(filePath);
    let fileCache: CachedMetadata | null = null;
    if (tFile) {
        fileCache = app.metadataCache.getFileCache(tFile);
    }
    return new TasksFile(filePath, fileCache ?? {});
}
